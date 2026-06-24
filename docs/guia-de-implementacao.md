# PLANO DE IMPLEMENTAÇÃO POR ETAPAS

## Sistema de Gestão de Colaboradores PJ

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

## Objetivo

Implementar uma estrutura genérica que permita criar fluxos de aprovação sem necessidade de desenvolvimento específico para cada processo.

Essa estrutura será utilizada posteriormente pelos módulos de:

* Solicitação de férias
* Aprovação de comissões
* Aprovação de documentos
* Aprovação de pagamentos
* Futuros processos da empresa

---

## Exemplo de uso

### Fluxo de Férias

```text
Colaborador
    ↓
Gestora
    ↓
Controlador
    ↓
RH
```

### Fluxo de Comissão

```text
Vendedora
    ↓
Gestora
    ↓
Controlador
    ↓
Financeiro
```

O sistema não deve possuir esses fluxos fixos.

Os fluxos deverão ser cadastrados e configurados pelo administrador.

---

## TDD

Criar testes para:

### Fluxos

* Criar fluxo
* Editar fluxo
* Inativar fluxo

### Etapas

* Adicionar etapa ao fluxo
* Remover etapa
* Reordenar etapas

### Execução

* Iniciar processo
* Aprovar etapa
* Reprovar etapa
* Cancelar processo

### Regras

* Não avançar para próxima etapa sem aprovação
* Encerrar processo ao reprovar
* Encerrar processo ao concluir última etapa

---

## Funcionalidades

### Cadastro de Fluxos

Campos:

* Nome
* Descrição
* Ativo/Inativo

Exemplos:

* Aprovação de férias
* Aprovação de comissão
* Aprovação de documentos

---

### Cadastro de Etapas

Campos:

* Nome da etapa
* Ordem
* Responsável

Exemplo:

```text
Etapa 1
Nome: Gestora

Etapa 2
Nome: Controlador

Etapa 3
Nome: RH
```

---

### Instância de Aprovação

Quando um processo for iniciado:

Exemplo:

```text
Solicitação de férias #123
```

O sistema deverá:

* Criar uma instância do fluxo
* Registrar status atual
* Registrar aprovadores
* Registrar histórico

---

### Histórico

Registrar:

* Data
* Hora
* Usuário
* Ação

Exemplo:

```text
15/08/2026 09:10
Gestora aprovou

15/08/2026 11:45
Controlador aprovou

15/08/2026 14:00
RH aprovou
```

---

## APIs esperadas

### Fluxos

```http
POST /workflows

GET /workflows

PUT /workflows/{id}
```

### Etapas

```http
POST /workflows/{id}/steps

PUT /workflow-steps/{id}
```

### Processos

```http
POST /workflow-instances

POST /workflow-instances/{id}/approve

POST /workflow-instances/{id}/reject
```

---

## Entregável

Ao final da etapa deve ser possível:

### Cenário de teste

Criar um fluxo chamado:

```text
Aprovação de Férias
```

Com as etapas:

```text
1 - Gestora
2 - Controlador
3 - RH
```

Iniciar uma solicitação fictícia.

Aprovar cada etapa.

Resultado esperado:

```text
Status Final:
Aprovado
```

Todo o histórico deve estar registrado e consultável.

---

# ETAPA 7

# Gestão de Férias

## Objetivo

Implementar toda a estrutura responsável pelo controle de saldo de férias dos colaboradores, sem envolver solicitações ou aprovações.

Esta etapa é responsável apenas pelo cálculo e armazenamento das informações de férias.

---

## Entidades

### VacationBalance

Responsável por armazenar o saldo do colaborador.

Campos:

* collaborator_id
* available_days
* accrued_days
* used_days
* additional_days

### VacationPeriod

Representa um período aquisitivo.

Campos:

* collaborator_id
* start_date
* end_date
* entitled_days

### VacationGrant

Representa férias concedidas.

Campos:

* collaborator_id
* start_date
* end_date
* days_used

---

## TDD

Criar testes para:

### Saldo

* Criar saldo inicial
* Atualizar saldo
* Consultar saldo

### Período aquisitivo

* Criar período
* Encerrar período
* Calcular dias adquiridos

### Concessão

* Registrar férias concedidas
* Debitar saldo
* Impedir saldo negativo

---

## APIs

```http
GET /vacation-balances

GET /vacation-balances/{id}

POST /vacation-grants

GET /vacation-periods
```

---

## Frontend

* Listagem de saldos
* Detalhes do colaborador
* Histórico de férias
* Histórico de períodos aquisitivos

---

## Critério de aceite

Ao acessar um colaborador deve ser possível visualizar:

* Saldo atual
* Férias concedidas
* Dias utilizados
* Períodos aquisitivos

---

## Entregável

Módulo de controle de férias operacional.

---

# ETAPA 8

# Solicitação de Férias

## Objetivo

Permitir que colaboradores solicitem férias e que a solicitação passe pelo fluxo de aprovação configurado na Etapa 6.

---

## Entidades

### VacationRequest

Campos:

* collaborator_id
* start_date
* end_date
* requested_days
* justification
* status

---

## TDD

Criar testes para:

* Criar solicitação
* Cancelar solicitação
* Aprovar solicitação
* Reprovar solicitação
* Integrar com workflow
* Atualizar saldo após aprovação

---

## APIs

```http
POST /vacation-requests

GET /vacation-requests

POST /vacation-requests/{id}/cancel
```

---

## Frontend

* Solicitar férias
* Listar solicitações
* Aprovar solicitação
* Reprovar solicitação
* Visualizar histórico

---

## Critério de aceite

Criar uma solicitação de férias.

Fluxo:

* Gestora aprova
* Controlador aprova
* RH aprova

Resultado:

* Solicitação aprovada
* Saldo atualizado

---

## Entregável

Fluxo completo de solicitação de férias funcionando.

---

# ETAPA 9

# Gestão de Comissões

## Objetivo

Permitir registrar vendas e calcular comissões dos colaboradores.

---

## Entidades

### Sale

* collaborator_id
* development_name
* unit
* sale_date
* sale_amount

### Commission

* sale_id
* percentage
* commission_amount
* status

---

## TDD

Criar testes para:

* Registrar venda
* Calcular comissão
* Aprovar comissão
* Reprovar comissão
* Marcar pagamento

---

## APIs

```http
POST /sales

GET /sales

POST /commissions/{id}/approve

POST /commissions/{id}/reject

POST /commissions/{id}/pay
```

---

## Frontend

* Cadastro de venda
* Listagem de vendas
* Aprovação
* Controle de pagamento

---

## Critério de aceite

Cadastrar uma venda.

Valor:

R$ 500.000,00

Percentual:

2%

Resultado esperado:

Comissão gerada:

R$ 10.000,00

Fluxo aprovado e pagamento registrado.

---

## Entregável

Controle de comissão operacional.

---

# ETAPA 10

# Gestão de Custos

## Objetivo

Calcular automaticamente o custo mensal de cada colaborador.

---

## Entidades

### CostCategory

* name
* type
* active

### CollaboratorCost

* collaborator_id
* category_id
* amount
* recurring

---

## TDD

Criar testes para:

* Criar categoria
* Vincular custo
* Calcular custo mensal
* Provisionar férias
* Provisionar 13º

---

## APIs

```http
POST /cost-categories

GET /cost-categories

POST /collaborator-costs

GET /collaborator-costs
```

---

## Frontend

* Cadastro de categorias
* Cadastro de custos
* Demonstrativo mensal

---

## Critério de aceite

Colaborador:

* Remuneração: R$ 5.000
* Plano de saúde: R$ 300
* Alimentação: R$ 500

Resultado:

Custo mensal exibido corretamente.

---

## Entregável

Motor de custos operacional.

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
