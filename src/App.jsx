import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import JobMatcher from './pages/JobMatcher'
import CareerRoadmap from './pages/CareerRoadmap'
import MockInterview from './pages/MockInterview'
import Profile from './pages/Profile'
import SkillGapAnalyzer from './pages/SkillGapAnalyzer'
import AiAssistant from './pages/AiAssistant'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/jobs" element={<JobMatcher />} />
          <Route path="/skill-gap" element={<SkillGapAnalyzer />} />
          <Route path="/roadmap" element={<CareerRoadmap />} />
          <Route path="/interview" element={<MockInterview />} />
          <Route path="/assistant" element={<AiAssistant />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
