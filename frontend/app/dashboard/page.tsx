'use client'

import { useState } from 'react'
import DashboardView from '@/components/dashboard/DashboardView'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0a] text-[#7f8c8d] font-sans selection:bg-white selection:text-black overflow-x-hidden">
        <DashboardView
          loading={false}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          setLoading={() => {}}
        />
      </div>
    </ProtectedRoute>
  )
}
