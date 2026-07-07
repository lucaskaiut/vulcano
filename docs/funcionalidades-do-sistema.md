# Funcionalidades do Sistema Vulcano

**Sistema de Gestão de Colaboradores PJ** — Plataforma web centralizada para gerenciamento de contratados PJ e outros tipos de colaboradores.

---

## 1. Autenticação e Controle de Acesso (ACL)

### Autenticação
- Login com e-mail/senha via cookies HTTP-only (Laravel Sanctum)
- Recuperação e redefinição de senha com envio de e-mail
- Logout com invalidação de sessão

### Perfis de Acesso
- Sistema de permissões baseado em papéis (RBAC)
- 45 permissões granulares (criar, visualizar, editar, excluir, aprovar, etc.)
- 6 papéis padrão: Administrador, RH, Financeiro, Gestor, Controlador, Colaborador
- Escopo de dados por perfil: colaborador vê apenas seus dados, gestor vê equipe, admin vê tudo

### Gerenciamento de Papéis
- CRUD de papéis com seleção de permissões por grupo
- Atribuição múltipla de papéis por usuário

---

## 2. Gestão de Colaboradores (Usuários)

- CRUD completo de colaboradores (nome, e-mail, cargo, data de admissão, setor, empresa, valor/hora, etc.)
- Listagem com filtros: busca textual, status (ativo/inativo), setor, empresa
- Visualização detalhada com abas: dados cadastrais, histórico salarial, férias, documentos, notas fiscais, exames médicos

### Histórico Salarial
- Registro de alterações de salário com data de vigência
- Listagem cronológica vinculada ao colaborador

### Setores
- CRUD de setores organizacionais

### Empresas (Enterprises)
- CRUD de empresas/projetos vinculados aos colaboradores

---

## 3. Gestão de Férias (Vacation)

### Saldos
- Cálculo automático: 2,5 dias por mês completo a partir da data de admissão
- Visualização de dias adquiridos, usufruídos e saldo atual

### Períodos Aquisitivos
- Geração automática conforme data de admissão
- Controle de status: em curso, vencido, usufruído
- Gestão de dias adicionais (abono pecuniário)
- Concessão manual de dias extras

### Solicitações (Kanban)
- Colaborador solicita férias informando período e se deseja abono
- Fluxo de aprovação via kanban com colunas: pendente, em análise, aprovado, rejeitado
- Aprovação/rejeição em etapas configuráveis por workflow
- Notificações de mudança de status

---

## 4. Vendas e Comissões

- Registro de vendas vinculadas a colaborador, empresa e mês de referência
- Cálculo de comissão baseado em percentual configurável
- Fluxo de aprovação via kanban: pendente → aprovado → pago
- Possibilidade de rejeição com observação
- Dashlet no resumo do colaborador com total de vendas e comissões

---

## 5. Gestão de Custos

- CRUD de categorias de custo (tipo: fixo ou benefício)
- Registro manual de custos por colaborador (valor, data de referência, categoria)
- Cálculo automático de provisões mensais:
  - 13º salário: 1/12 do salário por mês
  - Férias: 1/12 do salário por mês
  - 1/3 de férias: 1/36 do salário por mês
- Regras de provisão configuráveis (percentual, categoria vinculada, tipo)
- Relatório de custos totais por colaborador (fixos + provisões)

---

## 6. Gestão de Documentos

- CRUD de tipos de documento (nome, obrigatoriedade, validade em meses)
- Upload de documentos vinculados a colaboradores
- Controle de data de expiração com base na validade do tipo
- Download de arquivos
- Indicador visual de documentos vencidos/próximos do vencimento

---

## 7. Notas Fiscais (Invoices)

- Registro mensal de notas fiscais por colaborador
- Campos: mês de referência, valor, número da nota, data de emissão, status (pendente/pago)
- Listagem com filtros por colaborador, mês e status
- Vínculo com o dashboard financeiro

---

## 8. Exames Médicos Periódicos

- Registro de exames por colaborador com data de realização
- Controle de periodicidade e próximo vencimento
- Status: vigente ou vencido
- Listagem com filtros e indicadores visuais

---

## 9. Workflow Engine (Motor de Fluxos)

- Configuração de etapas de aprovação por tipo de workflow:
  - Solicitação de Férias
  - Comissão
  - Documento
- Cada etapa tem: ordem, papéis autorizados a aprovar/rejeitar
- Instâncias de workflow rastreiam o histórico completo de ações
- Kanban visual para movimentação entre etapas
- Histórico detalhado com timeline de ações (quem, quando, qual ação, comentário)
- Notificações automáticas ao mudar de etapa

---

## 10. Notificações

- Notificações in-app vinculadas ao usuário
- Tipos: aprovação pendente, aprovado, rejeitado, etc.
- Contador de não lidas no header
- Marcação como lida individual ou em massa
- Envio de e-mails para notificações importantes (recuperação de senha, etc.)

---

## 11. Dashboard Executivo

- Resumo com KPIs principais na home
- Total de colaboradores ativos
- Próximas férias a vencer
- Documentos próximos do vencimento
- Exames médicos a vencer/vencidos

---

## 12. Relatórios

- Geração de relatórios nos formatos Excel (XLSX) e PDF
- Tipos de relatório disponíveis:
  - Colaboradores
  - Solicitações de Férias
  - Notas Fiscais
  - Exames Médicos
- Aplicação de filtros antes da exportação

---

## 13. Auditoria (Audit Log)

- Registro automático de todas as operações de criação, edição e exclusão
- Dados rastreados: modelo afetado, ID do registro, ação, valores antigos/novos, usuário responsável, data/hora
- Interface de consulta com filtros por modelo, ação e período

---

## 14. Preferências do Usuário

- Salvamento de preferências por usuário (temas, filtros padrão, etc.)
- Estrutura chave-valor flexível

---

## 15. Guia do Usuário

- Página de ajuda integrada renderizando documentação em markdown
- Explicações sobre uso de cada módulo do sistema

---

## Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| Backend | PHP 8.4, Laravel 13, MySQL 8.4 |
| Frontend | TypeScript 6, React 19, Vite 8, Tailwind CSS 4 |
| Estado | TanStack Query 5 |
| Roteamento | TanStack Router 1 |
| Formulários | React Hook Form 7 + Zod 4 |
| Testes | Pest 4 (145+ testes) |
| Infra | Docker, Nginx, MailHog |

---

*Documento gerado em 03/07/2026 — Status do projeto: 100% implementado (18 etapas concluídas)*
