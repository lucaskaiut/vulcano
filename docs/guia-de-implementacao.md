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

## TDD

Testar:

* Cálculo saldo
* Programação
* Concessão
* Períodos aquisitivos

---

## Funcionalidades

Saldo

Programadas

Concedidas

Dias adicionais

---

## Entregável

Módulo de férias concluído.

---

# ETAPA 8

# Solicitação de Férias

## TDD

Testar:

* Solicitação
* Aprovação
* Reprovação

---

## Integração

Workflow Engine

---

## Entregável

Fluxo completo funcionando.

---

# ETAPA 9

# Gestão de Comissões

## TDD

Testar:

* Cadastro venda
* Cálculo comissão
* Aprovação
* Pagamento

---

## Dados

Empreendimento

Unidade

Valor venda

Percentual

Valor comissão

---

## Entregável

Controle de comissão operacional.

---

# ETAPA 10

# Gestão de Custos

## Objetivo

Motor configurável.

---

## TDD

Testar:

* Categorias
* Custos fixos
* Custos provisionados

---

## Funcionalidades

Categorias configuráveis:

* Remuneração
* Férias
* 13º
* Saúde
* Alimentação
* VT
* Combustível

---

## Entregável

Custo mensal calculado.

---

# ETAPA 11

# Gestão de Documentos

## TDD

Testar:

* Upload
* Download
* Vencimento

---

## Funcionalidades

Tipos configuráveis.

---

## Entregável

Documentos controlados.

---

# ETAPA 12

# Notas Fiscais Mensais

## TDD

Testar:

* Cadastro
* Aprovação
* Pendências

---

## Entregável

Controle fiscal operacional.

---

# ETAPA 13

# Exames Periódicos

## TDD

Testar:

* Cadastro
* Vencimento
* Alertas

---

## Entregável

Controle de ASO funcional.

---

# ETAPA 14

# Notificações

## TDD

Testar:

* Disparo
* Filas
* Templates

---

## Funcionalidades

Emails:

* Aprovação
* Reprovação
* Solicitações
* Alertas

---

## Entregável

Notificações automáticas.

---

# ETAPA 15

# Dashboard Executivo

## TDD

Testar:

* Indicadores
* Filtros
* Consolidação

---

## Funcionalidades

KPIs:

* Custos
* Férias
* Comissões
* Pendências

---

## Entregável

Dashboard operacional.

---

# ETAPA 16

# Relatórios

## TDD

Testar:

* Excel
* PDF

---

## Relatórios

Colaboradores

Custos

Comissões

Férias

Documentos

---

## Entregável

Exportações concluídas.

---

# ETAPA 17

# Auditoria

## TDD

Testar:

* Inclusão
* Alteração
* Exclusão
* Aprovação

---

## Funcionalidades

Registrar:

* Usuário
* Data
* Operação

---

## Entregável

Rastreabilidade completa.

---

# ETAPA 18

# Homologação Final

## Objetivo

Validar todo o sistema.

---

## Critérios

100% dos testes passando.

Cobertura mínima:

* Services: 90%
* Requests: 90%
* Workflows: 90%

---

## Entregável

Sistema pronto para produção.
