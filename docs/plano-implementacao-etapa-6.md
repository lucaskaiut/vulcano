# Plano de Implementação — Etapa 6: Motor de Aprovações Configurável

## Decisões de Arquitetura (revisadas)

Após análise de negócio, o design foi ajustado:

1. **Workflows são fixos, definidos em código** — cada tipo (`vacation_request`, `commission`, etc.) é um caso do enum `WorkflowType`. O admin configura apenas as etapas de cada tipo.
2. **Tabela `workflows` é removida** — `WorkflowStep` e `WorkflowInstance` referenciam `workflow_type` (string) diretamente, sem FK.
3. **Kanban como UI principal** — cada módulo de negócio (férias, comissão) terá seu próprio kanban com colunas = etapas configuradas.
4. **Regras de visibilidade** — o escopo dos dados que cada usuário enxerga depende do seu papel:
   - Colaborador comum: vê apenas as próprias solicitações
   - Gestor: vê as próprias + as dos subordinados diretos (`manager_id`)
   - Aprovador de etapa: vê solicitações onde é responsável (por `role` ou `user`)
   - Admin/RH: vê tudo

---

## 1. Mudanças no Backend

### 1.1 Remover tabela `workflows`

**Rollback da migration** `2026_06_24_000007_create_workflows_table.php` ou criar nova migration para `dropIfExists('workflows')`.

### 1.2 Criar enum `WorkflowType`

```php
// api/app/Modules/Workflow/Domain/Enums/WorkflowType.php
enum WorkflowType: string
{
    case VacationRequest = 'vacation_request';
    case Commission = 'commission';
    case Document = 'document';

    public function label(): string
    {
        return match ($this) {
            self::VacationRequest => 'Aprovação de Férias',
            self::Commission => 'Aprovação de Comissão',
            self::Document => 'Aprovação de Documentos',
        };
    }
}
```

### 1.3 Alterar `WorkflowStep`

**Migration**: renomear `workflow_id` → `workflow_type` (string), remover FK.

**Modelo**:

```php
#[Fillable(['workflow_type', 'name', 'order', 'responsible_role_id', 'responsible_user_id'])]
class WorkflowStep extends Model
{
    // workflow_type é string (ex: 'vacation_request')
    // Remove relacionamento workflow()
    // Mantém responsibleRole(), responsibleUser()
}
```

### 1.4 Alterar `WorkflowInstance`

**Migration**: renomear `workflow_id` → `workflow_type` (string), remover FK.

**Modelo**:

```php
#[Fillable(['workflow_type', 'title', 'status', 'current_step_id', 'initiated_by_user_id', 'subject_type', 'subject_id'])]
class WorkflowInstance extends Model
{
    // workflow_type é string
    // Remove relacionamento workflow()
    // Mantém currentStep(), initiatedBy(), histories(), subject()
}
```

### 1.5 Revisar `WorkflowStepService`

- Método `listByType(WorkflowType $type)` — lista etapas de um tipo, ordenadas por `order`
- Método `create(WorkflowType $type, array $data)` — cria etapa associada ao tipo
- Métodos `update`, `delete`, `reorder` — recebem `WorkflowType` em vez de `Workflow`

### 1.6 Revisar `WorkflowInstanceService`

- `start()` — recebe `WorkflowType` em vez de `workflow_id`, busca etapas pelo tipo
- `list()` — aplica regras de **visibilidade** (ver seção 1.8)
- `approve()`, `reject()`, `cancel()` — sem alterações na assinatura

### 1.7 Revisar Controllers e Requests

**WorkflowStepController** — endpoints refletem `workflow_type`:

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/workflow-types/{type}/steps` | Listar etapas de um tipo |
| `POST` | `/workflow-types/{type}/steps` | Adicionar etapa |
| `PUT` | `/workflow-steps/{id}` | Atualizar etapa |
| `DELETE` | `/workflow-steps/{id}` | Remover etapa |
| `PUT` | `/workflow-steps/{id}/reorder` | Reordenar etapa |

**WorkflowInstanceController** — endpoints mantidos:

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/workflow-instances` | Listar processos (com escopo) |
| `GET` | `/workflow-instances/{id}` | Detalhes do processo |
| `POST` | `/workflow-instances` | Iniciar processo |
| `POST` | `/workflow-instances/{id}/approve` | Aprovar etapa |
| `POST` | `/workflow-instances/{id}/reject` | Reprovar |
| `POST` | `/workflow-instances/{id}/cancel` | Cancelar |

### 1.8 Regras de Visibilidade (scoping)

Implementar no `WorkflowInstanceService::list(User $user)`:

```php
public function list(User $user): Collection
{
    $query = WorkflowInstance::query()
        ->with(['currentStep', 'initiatedBy', 'histories.user']);

    // Admin/RH vê tudo — verificar por permissão
    if ($user->hasPermission('workflow_instances.view_all')) {
        return $query->orderByDesc('created_at')->get();
    }

    // Demais usuários: escopo restrito
    $query->where(function ($q) use ($user) {
        // 1. Solicitações que o próprio usuário iniciou
        $q->where('initiated_by_user_id', $user->id);

        // 2. Solicitações de subordinados diretos (gestor)
        $subordinateIds = User::where('manager_id', $user->id)->pluck('id');
        if ($subordinateIds->isNotEmpty()) {
            $q->orWhereIn('initiated_by_user_id', $subordinateIds);
        }

        // 3. Solicitações onde o usuário é responsável pela etapa atual
        //    (por role ou por user direto)
        $q->orWhere(function ($subQuery) use ($user) {
            $subQuery->whereHas('currentStep', function ($stepQuery) use ($user) {
                $stepQuery->where('responsible_user_id', $user->id);

                if ($user->roles()->exists()) {
                    $stepQuery->orWhereIn(
                        'responsible_role_id',
                        $user->roles()->pluck('id')
                    );
                }
            });
        });
    });

    return $query->orderByDesc('created_at')->get();
}
```

**Nova permissão no ACL:**

```php
// Adicionar ao enum Permission:
case WorkflowInstancesViewAll = 'workflow_instances.view_all';
// label: 'Visualizar todos os processos'
```

`workflow_instances.view` continua existindo como permissão base para acessar o módulo. `workflow_instances.view_all` é o "elevador" que remove o escopo restrito.

### 1.9 Revisar permissões

| Permissão | Label | Descrição |
|-----------|-------|-----------|
| `workflow_steps.view` | Visualizar etapas | Ver configuração de etapas |
| `workflow_steps.create` | Criar etapas | Adicionar etapas a um tipo |
| `workflow_steps.update` | Editar etapas | Alterar/reordenar etapas |
| `workflow_steps.delete` | Remover etapas | Excluir etapas |
| `workflow_instances.view` | Visualizar processos | Acessar listagem de instâncias |
| `workflow_instances.view_all` | Visualizar todos os processos | Burlar regra de escopo |
| `workflow_instances.create` | Iniciar processos | Criar nova instância |
| `workflow_instances.approve` | Aprovar etapas | Aprovar etapa pendente |
| `workflow_instances.reject` | Reprovar processos | Reprovar instância |
| `workflow_instances.cancel` | Cancelar processos | Cancelar instância |

Remover: `workflows.view`, `workflows.create`, `workflows.update` (tabela removida).

### 1.10 Ajustar Factories e Seeders

- Remover `WorkflowFactory`
- Atualizar `WorkflowStepFactory` para usar `workflow_type` em vez de `workflow_id`
- Atualizar `WorkflowInstanceFactory` similarmente
- Atualizar `PermissionSeeder` com as novas permissões
- Atualizar `TestUserSeeder` se referenciar workflows

### 1.11 Ajustar Testes

- `WorkflowTest` → remover ou adaptar para testar `WorkflowType`
- `WorkflowStepTest` → atualizar para usar `workflow_type`
- `WorkflowInstanceTest` → atualizar para usar `workflow_type`
- `WorkflowVacationApprovalTest` → atualizar
- Adicionar testes de visibilidade (novo)

---

## 2. Frontend

### 2.1 Estrutura de Arquivos

```
web/src/
├── types/
│   └── workflow.ts
├── schemas/
│   └── workflowSchemas.ts
├── services/
│   └── workflowService.ts
├── components/
│   └── workflow/
│       ├── WorkflowStatusBadge.tsx
│       ├── WorkflowHistoryTimeline.tsx
│       ├── WorkflowStepsEditor.tsx         # Admin: CRUD de etapas inline
│       ├── WorkflowKanban.tsx              # Kanban genérico (usa WorkflowType)
│       └── WorkflowKanbanCard.tsx          # Card dentro do kanban
├── hooks/
│   └── useWorkflowInstanceFilters.ts
└── pages/
    ├── WorkflowStepsPage.tsx               # Admin: configurar etapas
    ├── WorkflowInstancesPage.tsx           # Lista de processos (com filtros)
    └── WorkflowInstanceDetailPage.tsx      # Detalhes + aprovar/reprovar + histórico
```

### 2.2 Tipos (`types/workflow.ts`)

```typescript
export type WorkflowType = 'vacation_request' | 'commission' | 'document'
export type WorkflowInstanceStatus = 'in_progress' | 'approved' | 'rejected' | 'cancelled'
export type WorkflowHistoryAction = 'started' | 'approved' | 'rejected' | 'cancelled'

export interface WorkflowTypeInfo {
  type: WorkflowType
  label: string
}

export interface WorkflowStepResponsible {
  id: number
  name: string
}

export interface WorkflowStep {
  id: number
  workflow_type: WorkflowType
  name: string
  order: number
  responsible_role: WorkflowStepResponsible | null
  responsible_user: WorkflowStepResponsible | null
  created_at: string
  updated_at: string
}

export interface WorkflowInstanceHistory {
  id: number
  action: WorkflowHistoryAction
  action_label: string
  description: string
  notes: string | null
  user: { id: number; name: string } | null
  step: { id: number; name: string } | null
  created_at: string
}

export interface WorkflowInstance {
  id: number
  workflow_type: WorkflowType
  title: string
  status: WorkflowInstanceStatus
  status_label: string
  current_step: WorkflowStep | null
  initiated_by: { id: number; name: string } | null
  histories: WorkflowInstanceHistory[]
  created_at: string
  updated_at: string
}
```

### 2.3 Serviço (`services/workflowService.ts`)

```typescript
// Etapas (admin)
listSteps(type: WorkflowType)                      // GET  /workflow-types/{type}/steps -> WorkflowStep[]
createStep(type: WorkflowType, payload)             // POST /workflow-types/{type}/steps -> WorkflowStep
updateStep(stepId: number, payload)                 // PUT  /workflow-steps/{id} -> WorkflowStep
deleteStep(stepId: number)                          // DELETE /workflow-steps/{id} -> void
reorderStep(stepId: number, order: number)          // PUT  /workflow-steps/{id}/reorder -> WorkflowStep

// Instâncias
listInstances(params?)                              // GET  /workflow-instances -> WorkflowInstance[]
getInstance(id: number)                             // GET  /workflow-instances/{id} -> WorkflowInstance
startInstance(payload)                              // POST /workflow-instances -> WorkflowInstance
approveInstance(id: number, notes?)                 // POST /workflow-instances/{id}/approve -> WorkflowInstance
rejectInstance(id: number, notes?)                  // POST /workflow-instances/{id}/reject -> WorkflowInstance
cancelInstance(id: number, notes?)                  // POST /workflow-instances/{id}/cancel -> WorkflowInstance
```

### 2.4 Schemas (`schemas/workflowSchemas.ts`)

```typescript
export const workflowStepSchema = z.object({
  name: z.string().min(1, 'Informe o nome da etapa').max(255),
  responsible_role_id: z.number().int().nullable().optional(),
  responsible_user_id: z.number().int().nullable().optional(),
})

export const workflowActionSchema = z.object({
  notes: z.string().max(1000).nullable().optional(),
})
```

### 2.5 Páginas

#### `WorkflowStepsPage.tsx` — Admin: Configurar Etapas

**Acesso**: requer permissão `workflow_steps.view`

**Elementos**:
- `PageHeader` com título "Configuração de Workflows"
- `Select` para escolher o tipo de workflow (label do enum)
- `WorkflowStepsEditor`:
  - Lista numerada de etapas com nome, responsável (role ou user), ordem
  - Botões ↑↓ para reordenar
  - Botão ✕ para remover (com `ConfirmModal`)
  - Botão "+ Adicionar etapa" no final
  - Cada alteração dispara mutation (otimista ou com feedback)
- Estado: `useQuery` carrega etapas do tipo selecionado

#### `WorkflowInstancesPage.tsx` — Lista de Processos

**Acesso**: requer permissão `workflow_instances.view`

**Elementos**:
- `PageHeader` com título "Processos"
- Filtros: por tipo de workflow, por status
- `Table` com colunas:
  - Título (link para detail)
  - Tipo (label do WorkflowType)
  - Solicitante
  - Etapa atual
  - Status (badge colorido)
  - Data
- Paginação
- **Sem botão "Novo processo"** — processos são iniciados pelos módulos de negócio

#### `WorkflowInstanceDetailPage.tsx` — Detalhes + Ações

**Acesso**: requer permissão `workflow_instances.view`

**Elementos**:
- `PageHeader` com título + `WorkflowStatusBadge`
- Card de informações: título, tipo, solicitante, etapa atual, data
- Seção de ações (se `status === 'in_progress'` e usuário tem permissão):
  - Botão "Aprovar" — abre modal com campo de observação opcional
  - Botão "Reprovar" — abre modal com campo de observação opcional
  - Botão "Cancelar" — abre modal com campo de observação opcional
  - Validação: se o backend retornar erro 422 ("não é responsável"), exibe toast de erro
- `WorkflowHistoryTimeline` com todo o histórico

### 2.6 Componentes

#### `WorkflowStatusBadge.tsx`

Badge colorido:
- `in_progress` → azul, "Em andamento"
- `approved` → verde, "Aprovado"
- `rejected` → vermelho, "Reprovado"
- `cancelled` → cinza, "Cancelado"

#### `WorkflowHistoryTimeline.tsx`

Linha do tempo vertical:
- Container com `border-l-2`
- Cada item: bolinha colorida (ícone lucide) + card com data, usuário, ação, etapa, observação
- Ícones: `Play` (started), `Check` (approved), `X` (rejected), `Ban` (cancelled)

#### `WorkflowStepsEditor.tsx`

Componente interno da `WorkflowStepsPage`:
- Props: `type: WorkflowType`, `steps: WorkflowStep[]`
- Estado local para lista de etapas
- Cada linha: indicador de ordem (número), `Input` para nome, `SearchSelect` para role, `SearchSelect` para user, botões ↑↓, botão ✕
- Botão "Adicionar" insere linha vazia no final
- Mutations para create/update/delete/reorder

#### `WorkflowKanban.tsx` (será usado nas Etapas 8, 9, 11...)

Componente genérico de kanban:
- Props: `type: WorkflowType`, `instances: WorkflowInstance[]`
- Busca etapas do tipo e renderiza colunas dinâmicas
- Cada coluna = uma etapa do workflow + coluna extra "Concluído" no final
- Cards são renderizados via render prop ou slot
- Coluna "Concluído" mostra instâncias aprovadas/reprovadas/canceladas

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│    Solicitado    │     Gestora      │   Controlador    │        RH        │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ [Card: João]     │ [Card: Maria]    │ [Card: Pedro]    │ [Card: Ana]      │
│ Férias 10 ago    │ Férias 15 ago    │ Férias 20 ago    │ Férias 01 set    │
│ Aguardando       │ [✓ Aprovar]      │ [✓ Aprovar]      │ ✓ Concluído      │
│                  │ [✕ Reprovar]     │ [✕ Reprovar]     │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

#### `WorkflowKanbanCard.tsx`

Card individual com:
- Título da solicitação
- Nome do solicitante
- Datas (se aplicável)
- Botões de ação (aprovar/reprovar) se o usuário for responsável pela etapa atual

---

## 3. Navegação e Rotas

### 3.1 Menu (`config/navigation.ts`)

Adicionar item com ícone `GitBranch` (visível apenas para quem tem `workflow_steps.view` OU `workflow_instances.view`):

```typescript
{
  label: 'Workflows',
  href: '/workflows',
  title: 'Fluxos de Aprovação',
  icon: GitBranch,
}
```

### 3.2 Rotas (`router.tsx`)

```
/workflows                              -> WorkflowStepsPage (admin: configurar etapas)
/                                      (redireciona para steps se tem permissão de admin)
/workflow-instances                     -> WorkflowInstancesPage (listagem)
/workflow-instances/$id                 -> WorkflowInstanceDetailPage (detalhes)
```

Nota: `WorkflowKanban` será usado dentro das páginas de cada módulo (ex: `VacationRequestsPage` na Etapa 8), não como rota própria.

---

## 4. Ordem de Implementação

### Backend (≈ 3h)

1. Migration para remover `workflows` e alterar `workflow_steps` + `workflow_instances`
2. Criar enum `WorkflowType`
3. Atualizar modelo `WorkflowStep`
4. Atualizar modelo `WorkflowInstance`
5. Revisar `WorkflowStepService`
6. Revisar `WorkflowInstanceService` (incluindo regras de visibilidade)
7. Revisar controllers e requests
8. Atualizar `Permission` enum (remover 3, adicionar 4 novas)
9. Atualizar factories e seeders
10. Atualizar testes existentes + criar testes de visibilidade
11. Rodar testes e garantir que tudo passa

### Frontend (≈ 5h)

1. `types/workflow.ts`
2. `services/workflowService.ts`
3. `schemas/workflowSchemas.ts`
4. `WorkflowStatusBadge.tsx`
5. `WorkflowHistoryTimeline.tsx`
6. `WorkflowStepsEditor.tsx`
7. `WorkflowStepsPage.tsx`
8. `WorkflowInstancesPage.tsx`
9. `WorkflowInstanceDetailPage.tsx`
10. `WorkflowKanban.tsx` + `WorkflowKanbanCard.tsx`
11. `navigation.ts` + `router.tsx`

---

## 5. Critérios de Aceite

1. Admin acessa `/workflows`, seleciona "Aprovação de Férias" e configura 3 etapas (Gestora → Controlador → RH)
2. Admin pode reordenar etapas (mover "RH" para antes de "Controlador")
3. Admin pode remover uma etapa
4. Usuário sem permissão não vê o menu "Workflows"
5. Colaborador inicia solicitação de férias (via módulo de férias na Etapa 8) — processo é criado automaticamente
6. Colaborador vê apenas suas próprias solicitações na listagem
7. Gestor vê suas solicitações + as dos subordinados
8. Aprovador vê as solicitações onde é responsável pela etapa atual
9. Admin com `view_all` vê todas as solicitações
10. Aprovador aprova etapa → processo avança para próxima etapa
11. Aprovador reprova → processo encerra como "Reprovado"
12. Histórico do processo mostra todas as ações com data/hora/usuário/etapa
13. Kanban exibe cards organizados por etapa, com ações condicionais para o responsável

---

## 6. Estimativa de Esforço

| Fase | Itens | Tempo estimado |
|------|-------|---------------|
| Backend — Migrations + Enum | 1, 2 | 30 min |
| Backend — Models | 3, 4 | 30 min |
| Backend — Services | 5, 6 | 1h |
| Backend — Controllers + Requests | 7 | 30 min |
| Backend — Permissions + Seeders | 8, 9 | 30 min |
| Backend — Testes | 10, 11 | 1h |
| Frontend — Tipos + Service + Schemas | 1, 2, 3 | 30 min |
| Frontend — Componentes | 4, 5, 6 | 1h |
| Frontend — Páginas | 7, 8, 9 | 2h |
| Frontend — Kanban | 10 | 1h |
| Frontend — Rotas + Navegação | 11 | 15 min |
| **Total** | | **≈ 9 horas** |
