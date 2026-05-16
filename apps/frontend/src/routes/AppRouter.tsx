import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import RoleLayout from '@/layouts/RoleLayout'
import { LoginPage, appRoutes, getDefaultRouteForRole } from '@/routes/route-config'
// import GuestOnlyRoute from '@/routes/guards/GuestOnlyRoute'
import RequireAuth from '@/routes/guards/RequireAuth'
import RequireRole from '@/routes/guards/RequireRole'
import PageLoader from '@/shared/ui/loading/page-loader'

function RoleHomeRedirect() {
  const role = useAppSelector((state) => state.auth.user?.role)

  return <Navigate to={getDefaultRouteForRole(role)} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          // <GuestOnlyRoute>
            <Suspense fallback={<PageLoader label="Đang tải trang đăng nhập..." />}>
              <LoginPage />
            </Suspense>
          // </GuestOnlyRoute>
        }
      />

      <Route element={<RequireAuth />}>
        <Route element={<RoleLayout />}>
          <Route index element={<RoleHomeRedirect />} />

          {appRoutes.map((route) => {
            const RouteComponent = route.component

            return (
              <Route
                key={route.path}
                path={route.path.slice(1)}
                element={
                  <RequireRole allowedRoles={route.allowedRoles}>
                    <Suspense fallback={<PageLoader label="Đang tải trang..." fullScreen={false} />}>
                      <RouteComponent />
                    </Suspense>
                  </RequireRole>
                }
              />
            )
          })}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
