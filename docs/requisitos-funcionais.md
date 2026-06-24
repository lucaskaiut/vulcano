# Documento de Requisitos Funcionais

## Sistema de Gestão de Colaboradores PJ

### Versão 1.0

### Documento para validação do cliente

---

# 1. Objetivo

Disponibilizar uma plataforma centralizada para gestão de colaboradores PJ, permitindo controlar informações cadastrais, remuneração, férias, custos, comissões, documentos obrigatórios e fluxos de aprovação.

O sistema deverá ser flexível e configurável, possibilitando a criação de novas categorias e processos sem depender de desenvolvimento específico para cada necessidade futura.

---

# 2. Cadastro de Colaboradores

O sistema deverá permitir o cadastro e manutenção das informações dos colaboradores.

## Informações básicas

* Nome
* CPF/CNPJ
* E-mail
* Telefone
* Cargo/Função
* Área/Departamento
* Gestor responsável
* Data de início
* Status (Ativo/Inativo)

## Contratação

* Tipo de contratação
* Forma de remuneração
* Valor atual da remuneração

O sistema deverá permitir o cadastro de novos tipos de contratação futuramente.

Exemplos:

* PJ
* CLT
* Estágio
* Terceirizado
* Outros

---

# 3. Histórico de Remuneração

O sistema deverá manter histórico completo de alterações salariais.

Cada alteração deverá possuir:

* Valor anterior
* Novo valor
* Data de vigência
* Observação
* Responsável pela alteração

O sistema deverá permitir consulta ao histórico completo.

---

# 4. Gestão de Recesso/Férias

O sistema deverá permitir:

* Controle de períodos aquisitivos
* Controle de saldo disponível
* Registro de férias realizadas
* Registro de férias programadas
* Registro de dias adicionais
* Controle de pagamento do adicional de férias
* Controle de notas fiscais relacionadas às férias

O cálculo deverá ser realizado automaticamente conforme regras definidas pela empresa.

---

# 5. Solicitação de Férias

Os colaboradores poderão solicitar férias diretamente pelo sistema.

A solicitação deverá conter:

* Data de início
* Data de término
* Observações

## Fluxo de aprovação

A solicitação deverá seguir fluxo configurável.

Fluxo inicial:

1. Colaborador solicita
2. Gestora aprova
3. Controlador da área aprova
4. RH recebe para acompanhamento
5. Solicitação é concluída

O sistema deverá permitir alterar futuramente a quantidade de aprovadores.

---

# 6. Controle de Comissões

O sistema deverá permitir registrar vendas realizadas pelos colaboradores.

Cada venda deverá possuir:

* Empreendimento
* Unidade
* Data da venda
* Valor da venda
* Percentual de comissão
* Valor da comissão
* Observações

---

## Fluxo de validação da comissão

A comissão não deverá ser liberada automaticamente.

Fluxo inicial:

1. Vendedora registra a venda
2. Gestora valida
3. Controlador da área valida
4. Sistema envia para aprovação financeira
5. Comissão é liberada para pagamento

Status possíveis:

* Em análise
* Aguardando gestora
* Aguardando controlador
* Aprovada
* Rejeitada
* Paga

O fluxo deverá ser configurável para futuras alterações.

---

# 7. Gestão de Custos dos Colaboradores

O sistema deverá permitir calcular e acompanhar o custo mensal de cada colaborador.

Os custos deverão ser compostos por categorias configuráveis.

---

## Custos fixos

Exemplos:

* Remuneração
* Plano de saúde
* Vale alimentação
* Vale transporte
* Combustível
* Outros benefícios

---

## Custos provisionados

O sistema deverá permitir provisionamento mensal de valores futuros.

Exemplos:

* Férias
* Décimo terceiro
* Bonificações recorrentes

O valor deverá ser distribuído proporcionalmente ao longo dos meses para composição do custo real do colaborador.

---

## Demonstrativo de custo

O sistema deverá exibir:

* Custos por colaborador
* Custos por área
* Custos por período
* Custos consolidados da empresa

---

# 8. Controle de Documentos

O sistema deverá permitir controlar documentos obrigatórios dos colaboradores.

Os tipos de documentos deverão ser configuráveis.

Exemplos:

* Nota Fiscal mensal
* ASO (Exame periódico)
* Contratos
* Certificados
* Outros documentos

---

# 9. Controle de Notas Fiscais Mensais

O sistema deverá permitir controlar o envio mensal de notas fiscais dos colaboradores.

Cada registro deverá possuir:

* Competência
* Número da nota
* Valor
* Data de emissão
* Data de recebimento
* Anexos
* Observações

Status:

* Pendente
* Recebida
* Validada
* Rejeitada

O sistema deverá permitir identificar pendências.

---

# 10. Controle de Exames Periódicos

O sistema deverá permitir registrar exames obrigatórios.

Cada registro deverá possuir:

* Tipo do exame
* Data de realização
* Data de vencimento
* Observações
* Anexos

Status:

* Em dia
* Próximo do vencimento
* Vencido

O sistema deverá emitir alertas automáticos.

---

# 11. Fluxos de Aprovação

O sistema deverá possuir mecanismo configurável de aprovação.

Cada processo poderá possuir:

* Quantidade variável de aprovadores
* Ordem de aprovação
* Aprovação paralela ou sequencial
* Regras por área
* Regras por cargo

Exemplos de utilização:

* Aprovação de férias
* Aprovação de comissões
* Aprovação de documentos
* Aprovação de pagamentos

---

# 12. Notificações

O sistema deverá enviar notificações por e-mail para eventos configurados.

Exemplos:

* Solicitação criada
* Solicitação aprovada
* Solicitação rejeitada
* Comissão aprovada
* Documento pendente
* Nota fiscal pendente
* Exame próximo do vencimento
* Férias aprovadas

---

# 13. Relatórios

O sistema deverá disponibilizar relatórios em:

* Excel
* PDF

---

## Relatórios iniciais

### Colaboradores

* Lista de colaboradores
* Histórico salarial
* Contratos

### Férias

* Saldo de férias
* Férias programadas
* Férias realizadas

### Comissões

* Comissões por colaborador
* Comissões por período
* Comissões pendentes
* Comissões pagas

### Custos

* Custo por colaborador
* Custo por departamento
* Custo consolidado

### Documentação

* Notas fiscais pendentes
* Exames vencidos
* Documentos pendentes

---

# 14. Perfis de Acesso

O sistema deverá possuir controle de acesso baseado em perfis.

Perfis iniciais:

* Administrador
* RH
* Financeiro
* Gestor
* Controlador
* Colaborador

As permissões deverão ser configuráveis.

---

# 15. Auditoria

O sistema deverá registrar:

* Inclusões
* Alterações
* Exclusões
* Aprovações
* Reprovações

Registrando:

* Usuário
* Data
* Hora
* Operação realizada

---

# 16. Escalabilidade

O sistema deverá permitir:

* Criação de novos tipos de documentos
* Criação de novos tipos de benefícios
* Criação de novos tipos de custos
* Criação de novos fluxos de aprovação
* Criação de novos tipos de contratação
* Criação de novos relatórios

Sem necessidade de alteração das regras principais do sistema.
