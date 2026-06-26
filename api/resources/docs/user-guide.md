# Guia do Usuário — Vulcano

Sistema de Gestão de Colaboradores PJ

---

## 1. Dashboard

A tela inicial exibe uma visão geral do sistema com indicadores principais:

- **Colaboradores ativos** — total de pessoas cadastradas
- **Custo mensal estimado** — soma de salários, provisões (13º, férias, 1/3 férias) e benefícios manuais
- **Férias pendentes** — solicitações aguardando aprovação
- **Comissões pendentes** — comissões aguardando aprovação
- **Notas fiscais pendentes** — NFs aguardando aprovação
- **Exames vencidos** e **vencendo em 30 dias**

Clique em qualquer card para acessar a página correspondente. A seção **Acesso rápido** oferece atalhos para as ações mais comuns.

---

## 2. Colaboradores

Acesse pelo menu **Colaboradores**.

### Listagem
Visualize todos os colaboradores cadastrados com filtros por nome, e-mail, data de contratação e remuneração.

### Cadastro
Clique em **Novo colaborador** e preencha:
- Nome, cargo, data de contratação
- Gestor (opcional)
- Remuneração inicial
- E-mail e senha de acesso
- Perfis de acesso

### Edição
Ao editar um colaborador, você encontra seções adicionais:

- **Histórico salarial** — registre reajustes com data de vigência
- **Férias** — gerencie saldo, períodos aquisitivos e concessões manuais
- **Documentos** — upload de arquivos (contratos, certidões, etc.)
- **Notas fiscais** — visualize as NFs enviadas pelo colaborador e seus status
- **Exames periódicos** — registre exames com data de realização e vencimento

---

## 3. Férias

### Saldos
Acesse pelo menu **Férias**. A tabela mostra:
- **Saldo disponível** — dias que o colaborador pode usar
- **Dias adquiridos** — calculados automaticamente (2,5 dias por mês completo)
- **Dias utilizados** — dias já concedidos
- **Dias adicionais** — dias extras manuais

### Períodos Aquisitivos
Dentro da edição do colaborador, os períodos são calculados automaticamente a partir da data de contratação. Você pode encerrar um período manualmente.

### Concessão de Férias
Na edição do colaborador, use o formulário de concessão para registrar férias gozadas (data de início, fim e dias utilizados). O saldo é debitado automaticamente.

---

## 4. Solicitações de Férias

Acesse pelo menu **Solicitações**.

1. Clique em **Solicitar férias**
2. Informe data de início, término e justificativa (opcional)
3. A solicitação entra no fluxo de aprovação (kanban)
4. Aprovadores recebem notificação por e-mail
5. Ao ser totalmente aprovada, os dias são debitados automaticamente

O kanban mostra as etapas do fluxo. Cards podem ser aprovados ou reprovados por usuários com permissão.

---

## 5. Comissões

Acesse pelo menu **Comissões**.

1. Clique em **Registrar venda**
2. Informe empreendimento, unidade, data, valor da venda e percentual de comissão
3. A comissão é calculada automaticamente
4. A venda entra no fluxo de aprovação (kanban)
5. Após aprovada, aparece na seção **Comissões aprovadas — aguardando pagamento**
6. Clique em **Marcar como paga** para finalizar

---

## 6. Categorias de Custo

Acesse pelo menu **Categorias de custo**.

Cadastre categorias para classificar os custos manuais dos colaboradores. Exemplos:
- Plano de saúde (tipo `benefit`)
- Vale alimentação (tipo `benefit`)
- Seguro de vida (tipo `fixed`)

---

## 7. Custos

Acesse pelo menu **Custos**.

O demonstrativo mensal agrega automaticamente:
- **Salário base** — do cadastro do colaborador
- **Provisão 13º** — salário ÷ 12
- **Provisão Férias** — salário ÷ 12
- **Provisão 1/3 Férias** — (salário ÷ 12) ÷ 3
- **Benefícios manuais** — custos recorrentes vinculados ao colaborador
- **Comissões pagas** — comissões marcadas como pagas no mês
- **Férias concedidas** — dias de férias gozados no mês

### Vincular custo manual
Clique em **Vincular custo** para adicionar um custo a um colaborador (ex: plano de saúde de R$ 500). Marque **Recorrente** para que o valor seja contabilizado todo mês.

---

## 8. Documentos

### Tipos de Documento
Acesse pelo menu **Tipos de documento**. Cadastre os tipos de documentos aceitos (ex: Contrato Social, RG, CPF). Marque **Exige vencimento** se o documento expira.

### Upload
Na edição do colaborador, seção **Documentos**:
1. Clique em **Enviar documento**
2. Arraste o arquivo ou clique para selecionar (PDF, Word, Excel, Imagens)
3. Selecione o tipo de documento
4. Informe a data de vencimento (opcional)
5. Clique em **Enviar**

Documentos vencidos ou próximos do vencimento exibem badges de alerta. O sistema envia notificações diárias (08:00) para documentos vencendo em até 30 dias.

---

## 9. Notas Fiscais

Acesse pelo menu **Notas Fiscais**.

### Envio
1. Clique em **Enviar nota fiscal**
2. Informe competência (AAAA-MM), número da nota, valor e data de emissão
3. Selecione o arquivo da nota (PDF ou imagem)
4. A NF entra no fluxo de aprovação (kanban)

### Aprovação
O kanban mostra as NFs organizadas por etapa do fluxo. Aprovadores podem **Aprovar** ou **Reprovar**. Cada card possui botão de **Download** para visualizar a nota.

### Status
As NFs exibem status: **Pendente**, **Aprovada** ou **Reprovada**. O status é atualizado automaticamente conforme o andamento do fluxo.

---

## 10. Exames Periódicos

Na edição do colaborador, seção **Exames periódicos**:

1. Clique em **Registrar exame**
2. Informe o tipo (ex: ASO, Audiometria)
3. Data de realização e vencimento
4. Observações (opcional)
5. Anexe um arquivo (opcional)

Exames vencidos aparecem com badge vermelho. O sistema envia notificações diárias (08:00) para exames vencendo em até 30 dias.

---

## 11. Perfis e Permissões

Acesse pelo menu **Perfis**.

### Perfis
- **Administrador** — acesso total ao sistema
- **RH** — gerencia colaboradores, férias, documentos, NFs, exames, custos
- **Financeiro** — gerencia comissões e custos
- **Gestor** — aprova solicitações da sua equipe
- **Colaborador** — envia solicitações e NFs, visualiza seus próprios dados

### Criação de Perfil
1. Clique em **Novo perfil**
2. Informe nome e descrição
3. Selecione as permissões na lista de toggles

---

## 12. Workflows

Acesse pelo menu **Workflows**.

Configure as etapas de aprovação para cada tipo de processo:
- **Aprovação de Férias** — etapas para solicitações de férias
- **Aprovação de Comissão** — etapas para vendas/comissões
- **Aprovação de Nota Fiscal** — etapas para notas fiscais

Cada etapa define:
- **Nome** da etapa
- **Ordem** no fluxo
- **Responsável** — um cargo (ex: Financeiro) ou um usuário específico

---

## 13. Relatórios

Acesse pelo menu **Relatórios**.

Quatro tipos de relatório disponíveis em abas:
- **Colaboradores** — filtrar por nome
- **Férias** — filtrar por status
- **Notas Fiscais** — filtrar por status
- **Exames** — filtrar por vencidos/válidos

Cada relatório pode ser:
- **Visualizado na tela** — tabela com dados formatados
- **Exportado em PDF** — clique no botão PDF
- **Exportado em Excel** — clique no botão Excel

O nome do arquivo inclui o tipo de relatório e a data atual.

---

## 14. Auditoria

Acesse pelo menu **Auditoria**.

Registro automático de todas as alterações do sistema:
- **Criado** (verde) — quando um registro é criado
- **Atualizado** (azul) — quando um registro é modificado
- **Excluído** (vermelho) — quando um registro é removido

Filtre por tipo de ação. Clique em uma linha para expandir e ver exatamente quais campos foram alterados, com o valor anterior e o novo valor.

---

## 15. Notificações

O sistema envia notificações por e-mail nos seguintes eventos:

- **Processo aprovado** — quando seu processo é totalmente aprovado
- **Processo reprovado** — quando seu processo é reprovado
- **Nova etapa para aprovar** — quando um processo chega na sua etapa do fluxo
- **Nota fiscal enviada** — confirmação de envio
- **Solicitação de férias enviada** — confirmação de envio
- **Venda registrada** — confirmação de registro
- **Documento próximo do vencimento** — lembrete diário
- **Exame próximo do vencimento** — lembrete diário

No ambiente de desenvolvimento, os e-mails são capturados pelo MailHog (`http://localhost:8025`). Em produção, configure as credenciais SMTP no arquivo `.env`.

---

## Permissões por Perfil

| Funcionalidade | Admin | RH | Financeiro | Gestor | Colaborador |
|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gerenciar colaboradores | ✅ | ✅ | — | — | — |
| Visualizar colaboradores | ✅ | ✅ | ✅ | ✅ | — |
| Gerenciar férias | ✅ | ✅ | — | — | — |
| Solicitar férias | ✅ | ✅ | — | — | ✅ |
| Aprovar férias | ✅ | ✅ | — | ✅ | — |
| Gerenciar comissões | ✅ | — | ✅ | — | — |
| Aprovar comissões | ✅ | — | ✅ | — | — |
| Gerenciar custos | ✅ | ✅ | ✅ | — | — |
| Gerenciar documentos | ✅ | ✅ | — | — | — |
| Gerenciar NFs | ✅ | ✅ | — | — | — |
| Enviar NFs | ✅ | ✅ | — | — | ✅ |
| Aprovar NFs | ✅ | ✅ | — | — | — |
| Gerenciar exames | ✅ | ✅ | — | — | — |
| Gerenciar perfis | ✅ | — | — | — | — |
| Gerenciar workflows | ✅ | ✅ | — | — | — |
| Relatórios | ✅ | ✅ | ✅ | ✅ | — |
| Auditoria | ✅ | ✅ | — | — | — |
