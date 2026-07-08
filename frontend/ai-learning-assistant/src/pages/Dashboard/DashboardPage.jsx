import React, { useState, useEffect } from 'react'
import Spinner from '../../components/common/Spinner'
import progressService from '../../services/progressService'
import toast from 'react-hot-toast'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock } from 'lucide-react'

const DashBoardPage = () => {

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgressData = async () => {
      try{
        const data = await progressService.getDashboardData()
        console.log('Data__getDashboardData', data)
        setDashboardData(data)
        } catch (error) {
          toast.error('Failed to fetch dashboard data')
          console.error(error)
        } finally {
          setLoading(false)
        }
      }
    fetchProgressData()
    }, []) 

    if (loading) {
      return <Spinner />
    }

    if( !dashboardData || !dashboardData.overview) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm">No Dashboard data available</p>
          </div>
        </div>
      )
    }

    const stats = [
      {
        title: 'Total Documents',
        value: dashboardData.overview.totalDocuments,
        icon: FileText,
        gradientFrom: 'from-blue-400 to-cyan-400',
        shadowColor: 'shadow-blue-500/25',
      },
      {
        title: 'Total Flashcards',
        value: dashboardData.overview.totalFlashcards,
        icon: BookOpen,
        gradientFrom: 'from-purple-400 to-pink-400',
        shadowColor: 'shadow-purple-500/25',
      },
      {
        title: 'Total Quizzes',
        value: dashboardData.overview.totalQuizzes,
        icon: BrainCircuit,
        gradientFrom: 'from-emerald-400 to-teal-400',
        shadowColor: 'shadow-emerald-500/25',
      }
    ]

  return (
    <div>
      Dashboard Page
    </div>
  )
}

export default DashBoardPage
