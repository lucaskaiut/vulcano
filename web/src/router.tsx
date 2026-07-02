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
import { CostCategoriesPage } from './pages/CostCategoriesPage'
import { CostCategoryFormPage } from './pages/CostCategoryFormPage'
import { CostsListPage } from './pages/CostsListPage'
import { CostsFormPage } from './pages/CostsFormPage'
import { DocumentTypesPage } from './pages/DocumentTypesPage'
import { DocumentTypeFormPage } from './pages/DocumentTypeFormPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { ReportsPage } from './pages/ReportsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { UserGuidePage } from './pages/UserGuidePage'
import { SalesPage } from './pages/SalesPage'
import { VacationBalancesPage } from './pages/VacationBalancesPage'
import { VacationRequestsPage } from './pages/VacationRequestsPage'
import { UsersPage } from './pages/UsersPage'
import { WorkflowStepsPage } from './pages/WorkflowStepsPage'
import { WorkflowInstancesPage } from './pages/WorkflowInstancesPage'
import { WorkflowInstanceDetailPage } from './pages/WorkflowInstanceDetailPage'
import { SectorsPage } from './pages/SectorsPage'
import { SectorFormPage } from './pages/SectorFormPage'
import { EnterprisesPage } from './pages/EnterprisesPage'
import { EnterpriseFormPage } from './pages/EnterpriseFormPage'

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

const costsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'costs',
  component: CostsListPage,
})

const costsNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'costs/novo',
  component: CostsFormPage,
})

const costsEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'costs/$id/editar',
  component: CostsFormPage,
})

const costCategoriesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'cost-categories',
  component: CostCategoriesPage,
})

const costCategoriesNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'cost-categories/novo',
  component: CostCategoryFormPage,
})

const costCategoriesEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'cost-categories/$id/editar',
  component: CostCategoryFormPage,
})

const documentTypesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'document-types',
  component: DocumentTypesPage,
})

const documentTypesNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'document-types/novo',
  component: DocumentTypeFormPage,
})

const documentTypesEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'document-types/$id/editar',
  component: DocumentTypeFormPage,
})

const invoicesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'invoices',
  component: InvoicesPage,
})

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'reports',
  component: ReportsPage,
})

const auditLogsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'audit-logs',
  component: AuditLogsPage,
})

const userGuideRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'user-guide',
  component: UserGuidePage,
})

const salesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'sales',
  component: SalesPage,
})

const vacationBalancesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'vacation-balances',
  component: VacationBalancesPage,
})

const vacationRequestsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'vacation-requests',
  component: VacationRequestsPage,
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

const sectorsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'sectors',
  component: SectorsPage,
})

const sectorsNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'sectors/novo',
  component: SectorFormPage,
})

const sectorsEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'sectors/$id/editar',
  component: SectorFormPage,
})

const enterprisesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'enterprises',
  component: EnterprisesPage,
})

const enterprisesNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'enterprises/novo',
  component: EnterpriseFormPage,
})

const enterprisesEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'enterprises/$id/editar',
  component: EnterpriseFormPage,
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
    costsRoute,
    costsNewRoute,
    costsEditRoute,
    costCategoriesRoute,
    costCategoriesNewRoute,
    costCategoriesEditRoute,
    documentTypesRoute,
    documentTypesNewRoute,
    documentTypesEditRoute,
    invoicesRoute,
    reportsRoute,
    auditLogsRoute,
    userGuideRoute,
    salesRoute,
    vacationBalancesRoute,
    vacationRequestsRoute,
    rolesRoute,
    roleNewRoute,
    roleEditRoute,
    workflowStepsRoute,
    workflowInstancesRoute,
    workflowInstanceDetailRoute,
    sectorsRoute,
    sectorsNewRoute,
    sectorsEditRoute,
    enterprisesRoute,
    enterprisesNewRoute,
    enterprisesEditRoute,
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
