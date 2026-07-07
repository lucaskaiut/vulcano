# Guia de Permissões do Vulcano

Este documento descreve todas as permissões do sistema, onde são aplicadas no backend (rotas/middleware) e no frontend (navegação/botões/seções).

---

## Como funciona o ACL

### Backend (Laravel)
- As permissões são definidas no enum `App\Modules\User\Domain\Enums\Permission` (46 slugs)
- Cada permissão é uma string única (ex: `users.view`)
- Perfis (`roles`) armazenam uma lista de permissoes em JSON (`permission_slugs`)
- Usuários herdam permissões através dos perfis atribuídos
- Nas rotas, o middleware `permission:slug` bloqueia requisições com **403 Forbidden**
- Nos services, `$user->hasPermission('slug')` controla escopo de dados:
  - Sem `view_all`: usuário vê apenas seus próprios registros + subordinados diretos
  - Com `view_all`: usuário vê todos os registros do domínio
- O dashboard também respeita escopo: contagens são filtradas por `view_all`

### Frontend (React)
- O hook `usePermissions()` extrai `permission_slugs` dos perfis do usuário logado
- `can('slug')` retorna `true/false` e controla visibilidade de:
  - Itens do menu lateral
  - Acesso a páginas (redireciona para `/` se não tiver permissão)
  - Botões de ação (criar, editar, excluir)
  - Abas de relatórios
  - Cartões do dashboard (cada card é renderizado condicionalmente de acordo com a permissão correspondente)
  - Seção "Acesso rápido" (escondida se nenhum botão estiver disponível)

---

## Módulo: Colaboradores (`users.*`)

| Permissão | Descrição | Backend (rotas protegidas) | Frontend (o que controla) |
|---|---|---|---|
| `users.view` | Visualizar colaboradores | `GET /users`, `GET /users/{id}`, `GET /sectors`, `GET /reports/collaborators` | Menu "Colaboradores", menu "Setores", menu "Relatórios", página de listagem, página de detalhes, aba de relatórios, card "Colaboradores ativos" no dashboard |
| `users.create` | Criar colaboradores | `POST /users` | Página de novo colaborador, botão "Novo colaborador" no dashboard, botão "Novo setor" |
| `users.update` | Editar colaboradores | `PUT /users/{id}`, `POST|PUT /users/{id}/salary-histories` | Página de edição de colaborador/setor, botões "Editar" nas listagens |
| `users.delete` | Excluir colaboradores | `DELETE /users/{id}` | *(sem verificação no frontend)* |

---

## Módulo: Perfis (`roles.*`)

| Permissão | Descrição | Backend (rotas protegidas) | Frontend (o que controla) |
|---|---|---|---|
| `roles.view` | Visualizar perfis | `GET /roles`, `GET /permissions` | Menu "Perfis", página de listagem |
| `roles.create` | Criar perfis | `POST /roles` | Página de novo perfil |
| `roles.update` | Editar perfis | `PUT /roles/{id}` | Página de edição de perfil |
| `roles.delete` | Excluir perfis | `DELETE /roles/{id}` | *(sem verificação no frontend)* |

---

## Módulo: Workflow (`workflow_steps.*` / `workflow_instances.*`)

| Permissão | Descrição | Backend (rotas protegidas) | Frontend (o que controla) |
|---|---|---|---|
| `workflow_steps.view` | Visualizar etapas | `GET /workflow-types/{type}/steps` | *(sem verificação no frontend)* |
| `workflow_steps.create` | Criar etapas | `POST /workflow-types/{type}/steps` | *(sem verificação no frontend)* |
| `workflow_steps.update` | Editar/reordenar etapas | `PUT /workflow-steps/{id}`, `PUT /workflow-steps/{id}/reorder` | Menu "Workflows", página de configuração |
| `workflow_steps.delete` | Excluir etapas | `DELETE /workflow-steps/{id}` | *(sem verificação no frontend)* |
| `workflow_instances.view` | Visualizar processos | `GET /workflow-instances`, `GET /workflow-instances/{id}` | Página de processos, página de detalhes |
| `workflow_instances.view_all` | Ver todos os processos | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |
| `workflow_instances.create` | Iniciar processos | `POST /workflow-instances` | *(sem verificação no frontend)* |
| `workflow_instances.approve` | Aprovar processos | `POST /workflow-instances/{id}/approve` | *(sem verificação no frontend)* |
| `workflow_instances.reject` | Reprovar processos | `POST /workflow-instances/{id}/reject` | *(sem verificação no frontend)* |
| `workflow_instances.cancel` | Cancelar processos | `POST /workflow-instances/{id}/cancel` | *(sem verificação no frontend)* |

---

## Módulo: Férias (`vacation_*`)

### Saldos (`vacation_balances.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `vacation_balances.view` | Visualizar saldos | `GET /vacation-balances`, `GET /vacation-balances/{id}` — escopo: próprio + subordinados | Menu "Férias", página de saldos |
| `vacation_balances.create` | Criar saldo inicial | `POST /vacation-balances` | *(sem verificação no frontend)* |
| `vacation_balances.update` | Atualizar saldo (dias adicionais) | `PUT /vacation-balances/{id}` | *(sem verificação no frontend)* |
| `vacation_balances.view_all` | Ver todos os saldos | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |

### Concessões (`vacation_grants.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `vacation_grants.view` | Visualizar concessões | `GET /vacation-grants` — escopo: próprio + subordinados (com `?user_id=` vê de um usuário específico) | *(sem verificação no frontend)* |
| `vacation_grants.create` | Registrar concessão | `POST /vacation-grants` | *(sem verificação no frontend)* |
| `vacation_grants.update` | Editar concessão | `PUT /vacation-grants/{id}` | *(sem verificação no frontend)* |
| `vacation_grants.delete` | Excluir concessão | `DELETE /vacation-grants/{id}` | *(sem verificação no frontend)* |
| `vacation_grants.view_all` | Ver todas as concessões | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |

### Períodos Aquisitivos (`vacation_periods.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `vacation_periods.view` | Visualizar períodos | `GET /vacation-periods` — escopo: próprio + subordinados | *(sem verificação no frontend)* |
| `vacation_periods.create` | Criar período | `POST /vacation-periods` | *(sem verificação no frontend)* |
| `vacation_periods.close` | Encerrar período | `POST /vacation-periods/{id}/close` | *(sem verificação no frontend)* |
| `vacation_periods.view_all` | Ver todos os períodos | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |

### Solicitações (`vacation_requests.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `vacation_requests.view` | Visualizar solicitações | `GET /vacation-requests`, `GET /reports/vacation-requests` | Menu "Solicitações", aba de relatórios, card "Férias pendentes" no dashboard |
| `vacation_requests.create` | Criar solicitação | `POST /vacation-requests` | Botão "Solicitar férias" no dashboard |
| `vacation_requests.cancel` | Cancelar solicitação | `POST /vacation-requests/{id}/cancel` | *(sem verificação no frontend)* |
| `vacation_requests.view_all` | Ver todas as solicitações | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |
| `vacation_requests.approve` | Aprovar solicitações | **NÃO UTILIZADA** ⚠️ | — |
| `vacation_requests.reject` | Reprovar solicitações | **NÃO UTILIZADA** ⚠️ | — |

> **Nota:** Aprovação/reprovação de solicitações de férias é feita pelo workflow (`workflow_instances.approve`/`reject`), não por estas permissões dedicadas.

---

## Módulo: Comissões (`commissions.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `commissions.view` | Visualizar comissões | `GET /sales`, `GET /enterprises` | Menu "Comissões", menu "Empreendimentos", card "Comissões pendentes" no dashboard |
| `commissions.create` | Criar comissões/empreendimentos | `POST /sales`, `POST /enterprises`, `PUT /enterprises/{id}` | Página de nova comissão, botão "Registrar venda" no dashboard, editar empreendimento |
| `commissions.pay` | Pagar comissões | `POST /commissions/{id}/pay` | *(sem verificação no frontend)* |
| `commissions.view_all` | Ver todas as comissões | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |
| `commissions.approve` | Aprovar comissões | **NÃO UTILIZADA** ⚠️ | — |
| `commissions.reject` | Reprovar comissões | **NÃO UTILIZADA** ⚠️ | — |

---

## Módulo: Custos (`costs.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `costs.view` | Visualizar custos | `GET /cost-categories`, `GET /collaborator-costs`, `GET /provision-rules`, `GET /costs-report` — escopo: próprio + subordinados | Menu "Categorias", menu "Provisões", menu "Custos", card "Custo mensal estimado" no dashboard |
| `costs.create` | Criar custos/categorias/regras | `POST /cost-categories`, `POST /collaborator-costs`, `POST|PUT /provision-rules` | Páginas de novo custo/categoria/regra, botões "Nova categoria" e "Nova regra", editar regra |
| `costs.update` | Editar custos/categorias | `PUT /cost-categories/{id}`, `PUT /collaborator-costs/{id}` | Botão "Editar" em categorias |
| `costs.delete` | Excluir custos | `DELETE /collaborator-costs/{id}` | *(sem verificação no frontend)* |
| `costs.view_all` | Ver todos os custos | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |

---

## Módulo: Documentos (`documents.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `documents.view` | Visualizar documentos | `GET /documents`, `GET /document-types`, `GET /users/{id}/documents`, download/preview — escopo global: próprio + subordinados | Menu "Tipos de documento", página de listagem |
| `documents.create` | Criar/editar tipos e enviar documentos | `POST /document-types`, `PUT /document-types/{id}`, `POST /users/{id}/documents` | Página de novo/editar tipo, botões "Novo tipo", "Editar", seção de upload |
| `documents.delete` | Excluir tipos e documentos | `DELETE /document-types/{id}`, `DELETE /documents/{id}` | Botões "Excluir" em documentos e tipos |
| `documents.view_all` | Ver todos os documentos | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |

---

## Módulo: Notas Fiscais (`invoices.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `invoices.view` | Visualizar notas | `GET /invoices`, `GET /users/{id}/invoices`, download, `GET /reports/invoices` | Menu "Notas Fiscais", aba de relatórios, card "Notas fiscais pendentes" no dashboard, seção no detalhe do colaborador |
| `invoices.create` | Enviar notas | `POST /invoices` | Botão "Enviar nota fiscal" no dashboard |
| `invoices.view_all` | Ver todas as notas | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |
| `invoices.approve` | Aprovar notas | **NÃO UTILIZADA** ⚠️ | — |
| `invoices.reject` | Reprovar notas | **NÃO UTILIZADA** ⚠️ | — |

---

## Módulo: Exames Médicos (`medical_exams.*`)

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `medical_exams.view` | Visualizar exames | `GET /medical-exams`, `GET /users/{id}/medical-exams`, download, `GET /reports/medical-exams` — escopo global: próprio + subordinados | Aba "Exames" nos relatórios, cards "Exames vencidos" e "Exames vencendo em 30 dias" no dashboard |
| `medical_exams.create` | Criar exames | `POST /users/{id}/medical-exams` | Botão "Novo exame" no detalhe do colaborador |
| `medical_exams.update` | Editar exames | `PUT /medical-exams/{id}` | Botão "Editar" em cada exame |
| `medical_exams.delete` | Excluir exames | `DELETE /medical-exams/{id}` | Botão "Excluir" em cada exame |
| `medical_exams.view_all` | Ver todos os exames | *(service: remove filtro de escopo)* | *(sem verificação no frontend)* |

---

## Outros

| Permissão | Descrição | Backend | Frontend |
|---|---|---|---|
| `notifications.view` | Visualizar notificações | `GET /notifications` | *(sem verificação no frontend)* |
| `audit.view` | Visualizar auditoria | `GET /audit-logs` | Menu "Auditoria", página de logs |

---

## Rotas sem proteção de permissão

Estas rotas exigem apenas autenticação (`auth:sanctum`), sem permissão específica:

| Rota | Acesso |
|---|---|
| `GET /me` | Qualquer usuário autenticado |
| `GET /dashboard` | Qualquer usuário autenticado |
| `GET /docs/user-guide` | Qualquer usuário autenticado |
| `GET|PATCH /me/preferences` | Qualquer usuário autenticado |

---

## Permissões não utilizadas (mortas)

Estas 6 permissões existem no enum mas **não são verificadas em nenhuma rota ou serviço**. A aprovação/reprovação é delegada ao módulo de workflow:

- `vacation_requests.approve`
- `vacation_requests.reject`
- `commissions.approve`
- `commissions.reject`
- `invoices.approve`
- `invoices.reject`

---

## Criação de perfil recomendada

### Administrador (acesso total)
Todas as permissões, exceto as 6 não utilizadas (aprove/reject).

### RH
```
users.view, users.create, users.update
vacation_balances.view, vacation_balances.update, vacation_balances.view_all
vacation_grants.view, vacation_grants.create, vacation_grants.update, vacation_grants.delete, vacation_grants.view_all
vacation_periods.view, vacation_periods.create, vacation_periods.close, vacation_periods.view_all
vacation_requests.view, vacation_requests.create, vacation_requests.cancel, vacation_requests.view_all
documents.view, documents.create, documents.delete, documents.view_all
medical_exams.view, medical_exams.create, medical_exams.update, medical_exams.delete, medical_exams.view_all
notifications.view, audit.view
```

### Gestor
```
users.view
vacation_balances.view
vacation_grants.view
vacation_periods.view
vacation_requests.view, vacation_requests.create, vacation_requests.cancel
workflow_instances.view, workflow_instances.approve, workflow_instances.reject
documents.view
invoices.view
costs.view
commissions.view
notifications.view
```

### Colaborador
```
users.view (apenas a si mesmo via escopo)
vacation_requests.view, vacation_requests.create, vacation_requests.cancel
invoices.view, invoices.create
documents.view
notifications.view
```

---

***Documento atualizado em 07/07/2026 — 46 permissões. Escopo por `view_all`: cada domínio filtra por próprio + subordinados por padrão.***
