# PLANO DE IMPLEMENTAÇÃO POR ETAPAS

## Sistema de Gestão de Colaboradores PJ

### Progresso: 18/18 etapas concluídas (100%)

| Etapa | Status |
|---|---|
| 1 — Fundação | ✅ |
| 2 — Autenticação | ✅ |
| 3 — Usuários e Perfis (ACL) | ✅ |
| 4 — Cadastro de Colaboradores | ✅ |
| 5 — Histórico Salarial | ✅ |
| 6 — Motor de Aprovações | ✅ |
| 7 — Gestão de Férias | ✅ |
| 8 — Solicitação de Férias | ✅ |
| 9 — Gestão de Comissões | ✅ |
| 10 — Gestão de Custos | ✅ |
| 11 — Gestão de Documentos | ✅ |
| 12 — Notas Fiscais Mensais | ✅ |
| 13 — Exames Periódicos | ✅ |
| 14 — Notificações | ✅ |
| 15 — Dashboard Executivo | ✅ |
| 16 — Relatórios | ✅ |
| 17 — Auditoria | ✅ |
| 18 — Homologação Final | ✅ |

### Stack real (pode divergir do planejado)

* Backend: Laravel 13, PHP 8.4, MySQL 8.4, SQLite (testes)
* Frontend: React 19, Vite, Tailwind CSS 4, TanStack Query, TanStack Router
* Permissões: enum-based (sem tabela), 45 permissões
* Testes: 141 passando, SQLite in-memory

---

# Diretrizes Gerais

## Stack

Backend:

* Laravel 13
* PHP 8.4
* MySQL 8.4
* Laravel Sanctum

Frontend:

* React 19
* Vite
* Tailwind CSS 4
* TanStack Query
* React Router

---

# Arquitetura Obrigatória

Backend:

```text
app/
└── Modules/
    ├── User/
    │   ├── Domain/
    │   │   ├── Models/
    │   │   ├── Services/
    │   │   ├── DTOs/
    │   │   ├── Enums/
    │   │   └── Contracts/
    │   └── Http/
    │       ├── Controllers/
    │       ├── Requests/
    │       └── Resources/
    ├── Collaborator/
    ├── Vacation/
    ├── Commission/
    ├── Cost/
    ├── Document/
    ├── Workflow/
    └── Notification/
```

---

## Regras Arquiteturais

Controller:

* Apenas orquestra requisições
* Nunca contém regra de negócio

Request:

* Toda validação de entrada

Resource:

* Toda saída padronizada

Service:

* Toda regra de negócio

Model:

* Apenas persistência

---

## TDD Obrigatório

Toda funcionalidade deve seguir:

Passo 1:

Criar teste

Passo 2:

Executar teste e validar falha

Passo 3:

Implementar código

Passo 4:

Executar testes

Passo 5:

Refatorar

Nenhuma funcionalidade deve ser implementada sem testes prévios.

---

# ETAPA 1

# Fundação do Projeto

## Objetivo

Preparar backend e frontend.

---

## Backend

Implementar:

* Laravel 13
* Sanctum
* Estrutura modular
* Configuração de testes
* Pest
* Factories
* Seeders

---

## Frontend

Implementar:

* React 19
* Tailwind 4
* TanStack Query
* React Router
* Estrutura de páginas
* Estrutura de serviços

---

## Entregável

Sistema inicial funcionando.

Critérios:

* Backend sobe
* Frontend sobe
* Banco conectado
* Testes executando

---

# ETAPA 2

# Autenticação

## Objetivo

Implementar autenticação completa.

---

## TDD

Criar testes para:

* Login válido
* Login inválido
* Logout
* Usuário autenticado
* Usuário não autenticado
* Recuperação de senha
* Reset de senha

---

## Funcionalidades

Endpoints:

POST /login

POST /logout

GET /me

POST /forgot-password

POST /reset-password

---

## Segurança

Sanctum SPA

Cookie HTTP-Only

CSRF

Sem armazenamento de token no localStorage.

---

## Frontend

Tela Login

Tela Esqueci Senha

Tela Reset Senha

Auth Context

Protected Routes (pagina de login e recuperar a senha são publicas. Rota "/" e demais são bloqueadas. Valide as rotas publicas, exeções devem ser privadas.)

---

## Entregável

Usuário consegue:

* Entrar
* Sair
* Recuperar senha

Todos os testes passando.

---

# ETAPA 3

# Usuários e Perfis

## Objetivo

Implementar ACL.

---

## TDD

Testar:

* Criação de usuários
* Atualização
* Exclusão
* Perfis
* Permissões

---

## Funcionalidades

CRUD Usuários

CRUD Perfis

CRUD Permissões

---

## Entregável

Sistema de acesso completo.

---

# ETAPA 4

# Cadastro de Colaboradores

## TDD

Testar:

* Cadastro
* Atualização
* Exclusão
* Consulta

---

## Funcionalidades

Cadastro completo:

* Nome
* Cargo
* Contratação
* Gestor
* Remuneração

---

## Frontend

Listagem

Formulário

Detalhes

---

## Entregável

Colaboradores gerenciados pelo sistema.

---

# ETAPA 5

# Histórico Salarial

## TDD

Testar:

* Inclusão
* Alteração
* Histórico

---

## Funcionalidades

Registro de reajustes.

---

## Entregável

Histórico salarial funcional.

---

# ETAPA 6

# Motor de Aprovações Configurável

## Status: ✅ Implementada

## O que foi implementado

Workflows são definidos como **enum fixo** (`WorkflowType`), não como tabela. O admin configura apenas as **etapas** de cada tipo de workflow.

### Entidades

* **WorkflowType** (enum): `vacation_request`, `commission`, `document`
* **WorkflowStep**: `workflow_type` (string), `name`, `order`, `responsible_role_id`, `responsible_user_id`
* **WorkflowInstance**: `workflow_type`, `title`, `status`, `current_step_id`, `initiated_by_user_id`, `subject` (polymorphic)
* **WorkflowInstanceHistory**: registro de cada ação no processo

### APIs

```http
GET    /workflow-types/{type}/steps        — Listar etapas
POST   /workflow-types/{type}/steps        — Adicionar etapa
PUT    /workflow-steps/{id}                — Atualizar etapa
DELETE /workflow-steps/{id}                — Remover etapa
PUT    /workflow-steps/{id}/reorder        — Reordenar etapa

GET    /workflow-instances                 — Listar processos (com escopo)
POST   /workflow-instances                 — Iniciar processo
GET    /workflow-instances/{id}            — Ver processo
POST   /workflow-instances/{id}/approve    — Aprovar etapa
POST   /workflow-instances/{id}/reject     — Reprovar
POST   /workflow-instances/{id}/cancel     — Cancelar
```

### Regras de visibilidade

* Colaborador vê apenas os próprios processos
* Gestor vê os próprios + subordinados diretos
* Aprovador vê processos onde é responsável por qualquer etapa do fluxo
* Admin com `workflow_instances.view_all` vê tudo

### Frontend

* **Workflows** (`/workflows`) — admin configura etapas por tipo de workflow
* **Processos** (`/workflow-instances`) — listagem de instâncias
* Kanban reutilizável (`WorkflowKanban`) usado nos módulos de férias e comissões

### Permissões

* `workflow_steps.view/create/update/delete` — Gerenciar etapas
* `workflow_instances.view/view_all/create/approve/reject/cancel` — Processos

---

# ETAPA 7

# Gestão de Férias

## Status: ✅ Implementada

## O que foi implementado

Cálculo automático: **2,5 dias por mês completo**, baseado na data de contratação. Apenas meses fechados contam — sem proporcional.

Fórmula: `meses_completos × 2,5`

### Entidades

* **VacationBalance**: `available_days` (calculado), `accrued_days` (calculado), `used_days`, `additional_days`, `additional_days_entries` (JSON)
* **VacationPeriod**: mantido para histórico, não é mais usado para cálculo
* **VacationGrant**: férias concedidas (debitam saldo)
* **VacationRequest**: solicitação de férias com workflow (Etapa 8)

### APIs

```http
GET    /vacation-balances
POST   /vacation-balances
GET    /vacation-balances/{id}
PUT    /vacation-balances/{id}

GET    /vacation-grants
POST   /vacation-grants

GET    /vacation-periods
POST   /vacation-periods
POST   /vacation-periods/{id}/close
```

### Frontend

* **Saldos de férias** (`/vacation-balances`) — tabela com saldo disponível, adquiridos, utilizados
* **Períodos aquisitivos** — cards visuais na tela do colaborador (calculados do hire_date)
* **Dias adicionais** — seção com entradas descritivas na tela do colaborador
* **Concessão manual** — formulário na tela do colaborador (datas + dias)

---

# ETAPA 8

# Solicitação de Férias

## Status: ✅ Implementada

## O que foi implementado

### Entidades

* **VacationRequest**: `user_id`, `start_date`, `end_date`, `requested_days` (calculado), `justification`, `status`, `workflow_instance_id`

### Fluxo

1. Colaborador solicita férias → cria `VacationRequest` + inicia `WorkflowInstance` com `workflow_type = 'vacation_request'`
2. Kanban mostra cards por etapa do workflow
3. Aprovador aprova/reprova via botões no card
4. Quando aprovado em todas as etapas → `VacationGrant` criado automaticamente → saldo debitado

### APIs

```http
GET    /vacation-requests                  — Listar solicitações
POST   /vacation-requests                  — Criar solicitação
POST   /vacation-requests/{id}/cancel       — Cancelar solicitação
```

### Frontend

* **Solicitações** (`/vacation-requests`) — kanban + formulário de solicitação
* Componente `WorkflowKanban` reutilizado

### Integração com Workflow

* `WorkflowInstanceService::approve()` chama `handleSubjectApproval()` ao aprovar última etapa
* Cria `VacationGrant` e debita `VacationBalance` automaticamente

### Regras de visibilidade

Mesmo padrão do workflow: colaborador vê próprio + gestor vê subordinados + aprovador vê onde é responsável

---

# ETAPA 9

# Gestão de Comissões

## Objetivo

Permitir registrar vendas e calcular comissões dos colaboradores.

---

## Status: ✅ Implementada

---

## O que foi implementado

### Entidades

### Sale

* collaborator_id
* development_name — empreendimento
* unit — unidade
* sale_date — data da venda
* sale_amount — valor da venda
* percentage — percentual de comissão (informado no cadastro)
* commission_amount — valor calculado automaticamente (`sale_amount * percentage / 100`)
* notes — observações

### Commission

* sale_id — venda vinculada
* percentage
* commission_amount
* status — pending, approved, rejected, paid
* workflow_instance_id — integração com motor de aprovações
* paid_at — data do pagamento
* paid_by_user_id — quem marcou como paga

### Integração com Workflow

Ao registrar a venda, o sistema cria uma `WorkflowInstance` com `workflow_type = 'commission'`. O kanban de aprovação usa o componente `WorkflowKanban` reaproveitado da etapa 8.

### APIs implementadas

```http
GET  /sales                        — Listar vendas/comissões
POST /sales                        — Registrar venda (cria comissão + inicia workflow)
POST /commissions/{id}/pay         — Marcar comissão como paga
```

### Frontend

* **Comissões** (`/sales`) — kanban de aprovação + formulário de venda + seção de comissões aprovadas aguardando pagamento

### Permissões

* `commissions.view` — Visualizar Comissões
* `commissions.create` — Criar Comissões
* `commissions.pay` — Pagar Comissões

---

# ETAPA 10

# Gestão de Custos

## Objetivo

Calcular automaticamente o custo mensal de cada colaborador.

---

## Status: ✅ Implementada

---

## O que foi implementado

### Cálculo automático de custos

O demonstrativo mensal (`GET /costs-report`) agrega automaticamente:

1. **Salário base** — do campo `salary` do colaborador
2. **Provisão 13º** — `salário / 12` por mês
3. **Provisão Férias** — `salário / 12` por mês
4. **Provisão 1/3 Férias** — `(salário / 12) / 3` por mês
5. **Benefícios manuais** — cadastrados via `collaborator_costs` (recorrentes)
6. **Comissões pagas no mês** — comissões com `paid_at` dentro do mês de referência
7. **Férias concedidas no mês** — `vacation_grants` criados no mês de referência

### Entidades

### CostCategory

* name — nome da categoria (ex: Plano de saúde, Vale alimentação)
* type — tipo (fixed, benefit, provisioned)
* active — ativo/inativo

### CollaboratorCost

* user_id — colaborador
* cost_category_id — categoria
* amount — valor
* recurring — se é recorrente (mensal) ou pontual
* reference_month — mês de referência (para custos pontuais)

### APIs implementadas

```http
GET  /costs-report                        — Demonstrativo mensal automático
GET  /cost-categories                     — Listar categorias (paginado)
GET  /cost-categories/list                — Listar categorias (completo, sem paginação)
POST /cost-categories                     — Criar categoria
GET  /cost-categories/{id}                — Ver categoria
PUT  /cost-categories/{id}                — Atualizar categoria
GET  /collaborator-costs                  — Listar custos manuais (paginado)
POST /collaborator-costs                  — Vincular custo manual
GET  /collaborator-costs/{id}             — Ver custo
PUT  /collaborator-costs/{id}             — Atualizar custo
DELETE /collaborator-costs/{id}           — Remover custo
```

### Frontend

* **Categorias de custo** (`/cost-categories`) — tabela paginada com CRUD
* **Custos** (`/costs`) — demonstrativo mensal automático + benefícios manuais

### Permissões

* `costs.view` — Visualizar Custos
* `costs.create` — Criar Custos
* `costs.update` — Atualizar Custos
* `costs.delete` — Excluir Custos

---

# ETAPA 11

# Gestão de Documentos

## Objetivo

Permitir armazenamento e controle de documentos dos colaboradores.

---

## Entidades

### DocumentType

* name
* expiration_required

### Document

* collaborator_id
* document_type_id
* file_path
* expiration_date

---

## TDD

Criar testes para:

* Upload
* Download
* Exclusão
* Controle de vencimento

---

## APIs

```http
POST /documents

GET /documents

DELETE /documents/{id}
```

---

## Frontend

* Upload
* Download
* Listagem
* Filtros

---

## Critério de aceite

Enviar documento e visualizar posteriormente.

---

## Entregável

Gestão documental concluída.

---

# ETAPA 12

# Notas Fiscais Mensais

## Objetivo

Controlar recebimento de notas fiscais dos colaboradores.

---

## Entidades

### Invoice

* collaborator_id
* competence
* invoice_number
* amount
* issue_date
* status

---

## TDD

Criar testes para:

* Cadastro
* Aprovação
* Reprovação
* Pendência

---

## Critério de aceite

Identificar colaboradores com NF pendente.

---

## Entregável

Controle fiscal operacional.

---

# ETAPA 13

# Exames Periódicos

## Objetivo

Controlar vencimento de ASOs e demais exames.

---

## Entidades

### MedicalExam

* collaborator_id
* exam_type
* execution_date
* expiration_date

---

## Critério de aceite

Exame vencido deve aparecer em alertas.

---

## Entregável

Controle de exames concluído.

---

# ETAPA 14

# Notificações

## Objetivo

Centralizar envio de e-mails do sistema.

---

## Funcionalidades

* Aprovação
* Reprovação
* Solicitação criada
* Documento vencendo
* NF pendente

---

## Critério de aceite

Evento ocorre e e-mail é enviado automaticamente.

---

## Entregável

Central de notificações operacional.

---

# ETAPA 15

# Dashboard Executivo

## Objetivo

Consolidar indicadores estratégicos.

---

## Indicadores

* Total colaboradores
* Custos mensais
* Férias pendentes
* Comissões pendentes
* NFs pendentes
* Exames vencidos

---

## Critério de aceite

Dashboard exibe informações consolidadas em tempo real.

---

## Entregável

Dashboard executivo concluído.

---

# ETAPA 16

# Relatórios

## Objetivo

Permitir exportação de dados.

---

## Relatórios

* Colaboradores
* Custos
* Férias
* Comissões
* Notas fiscais
* Exames

---

## Critério de aceite

Exportação para Excel e PDF funcionando.

---

## Entregável

Relatórios concluídos.

---

# ETAPA 17

# Auditoria

## Objetivo

Registrar todas as alterações relevantes.

---

## Entidades

### AuditLog

* user_id
* action
* entity
* entity_id
* old_data
* new_data

---

## Critério de aceite

Toda alteração deve gerar registro auditável.

---

## Entregável

Auditoria completa funcionando.

---

# ETAPA 18

# Homologação Final

## Objetivo

Validar todo o sistema antes da publicação.

---

## Checklist

* Todos os testes passando
* APIs documentadas
* Frontend integrado
* Relatórios funcionando
* Workflow funcionando
* Permissões funcionando

---

## Entregável

Sistema homologado e pronto para produção.
