import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { RoleFormPage } from './pages/RoleFormPage'
import { RolesPage } from './pages/RolesPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { UserFormPage } from './pages/UserFormPage'
import { UsersPage } from './pages/UsersPage'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'users/novo', element: <UserFormPage /> },
          { path: 'users/:id/editar', element: <UserFormPage /> },
          { path: 'users/:id', element: <UserDetailPage /> },
          { path: 'roles', element: <RolesPage /> },
          { path: 'roles/novo', element: <RoleFormPage /> },
          { path: 'roles/:id/editar', element: <RoleFormPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
