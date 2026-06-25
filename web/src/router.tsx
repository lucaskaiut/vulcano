import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import AppLayout from './components/layout/AppLayout'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { RoleFormPage } from './pages/RoleFormPage'
import { RolesPage } from './pages/RolesPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { UserFormPage } from './pages/UserFormPage'
import { VacationBalancesPage } from './pages/VacationBalancesPage'
import { UsersPage } from './pages/UsersPage'
import { WorkflowStepsPage } from './pages/WorkflowStepsPage'
import { WorkflowInstancesPage } from './pages/WorkflowInstancesPage'
import { WorkflowInstanceDetailPage } from './pages/WorkflowInstanceDetailPage'

// ---------------------------------------------------------------
// Root route
// ---------------------------------------------------------------
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// ---------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
})

// ---------------------------------------------------------------
// Layout route (protected)
// ---------------------------------------------------------------
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AppLayout,
})

// ---------------------------------------------------------------
// Protected child routes
// ---------------------------------------------------------------
const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
})

const usersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'users',
  component: UsersPage,
})

const userNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'users/novo',
  component: UserFormPage,
})

const userEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'users/$id/editar',
  component: UserFormPage,
})

const userDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'users/$id',
  component: UserDetailPage,
})

const vacationBalancesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'vacation-balances',
  component: VacationBalancesPage,
})

const rolesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'roles',
  component: RolesPage,
})

const roleNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'roles/novo',
  component: RoleFormPage,
})

const roleEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'roles/$id/editar',
  component: RoleFormPage,
})

const workflowStepsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'workflows',
  component: WorkflowStepsPage,
})

const workflowInstancesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'workflow-instances',
  component: WorkflowInstancesPage,
})

const workflowInstanceDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'workflow-instances/$id',
  component: WorkflowInstanceDetailPage,
})

// ---------------------------------------------------------------
// Route tree
// ---------------------------------------------------------------
const routeTree = rootRoute.addChildren([
  loginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  layoutRoute.addChildren([
    homeRoute,
    usersRoute,
    userNewRoute,
    userEditRoute,
    userDetailRoute,
    vacationBalancesRoute,
    rolesRoute,
    roleNewRoute,
    roleEditRoute,
    workflowStepsRoute,
    workflowInstancesRoute,
    workflowInstanceDetailRoute,
  ]),
])

// ---------------------------------------------------------------
// Router instance
// ---------------------------------------------------------------
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
