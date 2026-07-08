import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { validationResult } from "express-validator";


// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d', // Token expires in 7 days
    });
};

//@desc    Register a new user
//@route   POST /api/auth/register
//@access  Public
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // check if user exists
        const UserExists = await User.findOne({ $or: [{ email }, { username }] });

        if (UserExists) {
            return res.status(400).json({ 
                success: false,
                error: UserExists.email === email ? "Email already registered" : "Username already taken",
                statusCode: 400
            });
        }

        // create new user
        const user = await User.create({
            username,
            email,
            password
        });

        // generate token
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileimage,
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

//@desc    Login user and get token
//@route   POST /api/auth/login
//@access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password',
                statusCode: 400
            });
        }

        // check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401
            });
        }

        // check for password 

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401
            });
        }

        // generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileimage,
            },
            token,
            message: 'Login successfull'
        });
    }
    catch (error) {
        next(error);
    }
}

//@desc    Get user profile
//@route   GET /api/auth/profile
//@access  Private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileimage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
        });
    }
    catch (error) {
        next(error);
    }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const {username, email, profileImage} = req.body;

        const user = await User.findById(req.user._id);
        
        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileimage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileimage,
            },
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
}

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current and new password',
                statusCode: 400
            });
        }
        
        const user = await User.findById(req.user._id).select('+password');

        // check current password

        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
                statusCode: 401
            });
        }

        // update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        next(error);
    }
}