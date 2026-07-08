import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js'
import Quiz from '../models/Quiz.js'
import { extractTextFromPDF } from '../utils/pdfParser.js'
import { chunkText } from '../utils/textChunker.js'
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc   Upload PDF document
// @route  POST /api/documents/upload
// @access Private
export const uploadDocument = async (req, res, next) => {
    try {
        if(!req.file){
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF File',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if(!title){
            //Delete uploaded file if no file provided
            await fs.unlink(req.file.path)
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        
        }

        // construct the URL for the uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        //create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing'
        });

        // Process PDF in background (in production, use a queue like Bull)
        processPDF(document._id, req.file.path).catch(err =>{
            console.error('PDF processing error:', err)
        })

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });
    }catch (error) {
        // clean up file on error
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// helper function to process the pdf
const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);

        // create chunks
        const chunks = chunkText(text, 500, 50);

        // upload document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            numChunks: chunks.length,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`)
    } catch (error) {
        console.error(`Error processing Document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
}

// @desc Get all users documents
//@route GET /api/documents
//@access Private 

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcards'
                
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: {
                    uploadDate: -1
                }
            }

        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    }catch (error) {
        next(error);
    }
}

// @desc Get single document with chunks
//@route GET /api/documents/:id
//@access Private 

export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if(!document){
            return res.status(400).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            })
        }

        // Get count of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({documentId: document._id, userId: req.user._id})
        const quizCount = await Quiz.countDocuments({documentId: document._id, userId: req.user._id})

        //Update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        //Combine documents data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });
    }catch (error) {
        next(error);
    }
}

// @desc Delete document
//@route GET /api/documents/:id
//@access Private

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if(!document){
            return res.status(400).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            })
        }

        // Delete file from file system
        await fs.unlink(document.filePath).catch(() => {});

        //Delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        })
    }catch (error) {
        next(error);
    }
}