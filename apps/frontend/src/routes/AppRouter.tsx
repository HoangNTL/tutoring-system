import { Navigate, Route, Routes } from 'react-router-dom'

import {
  getDefaultMenuPathForRole,
} from '@/components/layout/AppMenu'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '@/features/auth/pages/LoginPage'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import LecturerAssignmentsPage from '@/pages/LecturerAssignmentsPage'
import ProfilePage from '@/pages/ProfilePage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import StudySchedulePage from '@/pages/StudySchedulePage'
import TeachingSchedulePage from '@/pages/TeachingSchedulePage'
import TutorialRegistrationPage from '@/pages/TutorialRegistrationPage'
import TutorialSchedulingPage from '@/pages/TutorialSchedulingPage'
import UsersPage from '@/pages/UsersPage'
import { useAppSelector } from '@/store/hooks'

function RoleHomeRedirect() {
  const role = useAppSelector((state) => state.auth.user?.role)

  return <Navigate to={getDefaultMenuPathForRole(role)} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleHomeRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutorial-periods"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UsersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutorial-scheduling"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TutorialSchedulingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lecturer-assignments"
        element={
          <ProtectedRoute>
            <MainLayout>
              <LecturerAssignmentsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-schedule"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TeachingSchedulePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutorial-registration"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TutorialRegistrationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-schedule"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StudySchedulePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
