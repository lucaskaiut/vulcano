import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground-muted">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-[13px] font-medium text-primary">
      {children}
    </code>
  )
}

function InlineList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>
}

function PermTable() {
  const rows = [
    ['Dashboard', '✅', '✅', '✅', '✅', '✅'],
    ['Gerenciar colaboradores', '✅', '✅', '—', '—', '—'],
    ['Visualizar colaboradores', '✅', '✅', '✅', '✅', '—'],
    ['Gerenciar férias', '✅', '✅', '—', '—', '—'],
    ['Solicitar férias', '✅', '✅', '—', '—', '✅'],
    ['Aprovar férias', '✅', '✅', '—', '✅', '—'],
    ['Gerenciar comissões', '✅', '—', '✅', '—', '—'],
    ['Aprovar comissões', '✅', '—', '✅', '—', '—'],
    ['Gerenciar custos', '✅', '✅', '✅', '—', '—'],
    ['Gerenciar documentos', '✅', '✅', '—', '—', '—'],
    ['Gerenciar NFs', '✅', '✅', '—', '—', '—'],
    ['Enviar NFs', '✅', '✅', '—', '—', '✅'],
    ['Aprovar NFs', '✅', '✅', '—', '—', '—'],
    ['Gerenciar exames', '✅', '✅', '—', '—', '—'],
    ['Gerenciar perfis', '✅', '—', '—', '—', '—'],
    ['Gerenciar workflows', '✅', '✅', '—', '—', '—'],
    ['Relatórios', '✅', '✅', '✅', '✅', '—'],
    ['Auditoria', '✅', '✅', '—', '—', '—'],
  ]

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-sunken">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-surface-sunken bg-surface-sunken/50">
          <tr>
            <th className="px-4 py-2.5 font-semibold text-foreground">Funcionalidade</th>
            <th className="px-4 py-2.5 font-semibold text-foreground">Admin</th>
            <th className="px-4 py-2.5 font-semibold text-foreground">RH</th>
            <th className="px-4 py-2.5 font-semibold text-foreground">Financeiro</th>
            <th className="px-4 py-2.5 font-semibold text-foreground">Gestor</th>
            <th className="px-4 py-2.5 font-semibold text-foreground">Colab.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-sunken">
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="px-4 py-2.5 font-medium text-foreground">{row[0]}</td>
              {row.slice(1).map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-center text-foreground-muted">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function UserGuidePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Guia do Usuário"
        description="Aprenda a usar todas as funcionalidades do Vulcano"
      />

      <Card className="mb-8 p-6">
        <p className="text-sm leading-relaxed text-foreground-muted">
          O <strong className="text-foreground">Vulcano</strong> é um sistema de gestão de colaboradores PJ
          que centraliza cadastro, férias, comissões, notas fiscais, documentos, exames, custos e
          fluxos de aprovação em um só lugar.
        </p>
      </Card>

      {/* 1. Dashboard */}
      <Section title="1. Dashboard">
        <p>
          A tela inicial exibe uma visão geral com cards de indicadores principais:
          colaboradores ativos, custo mensal estimado, férias e comissões pendentes,
          notas fiscais pendentes e exames vencidos ou próximos do vencimento.
        </p>
        <p>
          Clique em qualquer card para acessar a página correspondente. A seção{' '}
          <strong className="text-foreground">Acesso rápido</strong> oferece atalhos
          para as ações mais comuns do sistema.
        </p>
      </Section>

      {/* 2. Colaboradores */}
      <Section title="2. Colaboradores">
        <p>Acesse pelo menu <strong className="text-foreground">Colaboradores</strong>.</p>

        <SubSection title="Listagem">
          <p>Visualize todos os colaboradores cadastrados com filtros por nome, e-mail, data de contratação e remuneração.</p>
        </SubSection>

        <SubSection title="Cadastro">
          <p>Clique em <strong className="text-foreground">Novo colaborador</strong> e preencha: nome, cargo, data de contratação, gestor (opcional), remuneração inicial, e-mail, senha de acesso e perfis.</p>
        </SubSection>

        <SubSection title="Edição">
          <p>Ao editar um colaborador, você encontra seções adicionais na mesma página:</p>
          <InlineList>
            <li><strong className="text-foreground">Histórico salarial</strong> — registre reajustes com data de vigência</li>
            <li><strong className="text-foreground">Férias</strong> — gerencie saldo, períodos e concessões manuais</li>
            <li><strong className="text-foreground">Documentos</strong> — upload de arquivos com controle de vencimento</li>
            <li><strong className="text-foreground">Notas fiscais</strong> — visualize as NFs enviadas e seus status</li>
            <li><strong className="text-foreground">Exames periódicos</strong> — registre exames com data de vencimento</li>
          </InlineList>
        </SubSection>
      </Section>

      {/* 3. Férias */}
      <Section title="3. Férias (Saldos)">
        <p>Acesse pelo menu <strong className="text-foreground">Férias</strong>. A tabela mostra:</p>
        <InlineList>
          <li><strong className="text-foreground">Saldo disponível</strong> — dias que o colaborador pode usar</li>
          <li><strong className="text-foreground">Dias adquiridos</strong> — calculados automaticamente (2,5 dias por mês completo)</li>
          <li><strong className="text-foreground">Dias utilizados</strong> — dias já concedidos</li>
          <li><strong className="text-foreground">Dias adicionais</strong> — dias extras configurados manualmente</li>
        </InlineList>

        <SubSection title="Concessão de férias">
          <p>Na edição do colaborador, use o formulário para registrar férias gozadas (data de início, fim e dias). O saldo é debitado automaticamente.</p>
        </SubSection>
      </Section>

      {/* 4. Solicitações */}
      <Section title="4. Solicitações de Férias">
        <p>Acesse pelo menu <strong className="text-foreground">Solicitações</strong>.</p>
        <InlineList>
          <li>Clique em <strong className="text-foreground">Solicitar férias</strong></li>
          <li>Informe data de início, término e justificativa (opcional)</li>
          <li>A solicitação entra no fluxo de aprovação (kanban)</li>
          <li>Aprovadores recebem notificação por e-mail</li>
          <li>Ao ser totalmente aprovada, os dias são debitados do saldo automaticamente</li>
        </InlineList>
        <p>O <strong className="text-foreground">kanban</strong> mostra as etapas do fluxo. Cards podem ser aprovados ou reprovados por usuários com a permissão adequada. Use o botão <strong className="text-foreground">Reprovar</strong> com confirmação para rejeitar uma solicitação.</p>
      </Section>

      {/* 5. Comissões */}
      <Section title="5. Comissões">
        <p>Acesse pelo menu <strong className="text-foreground">Comissões</strong>.</p>
        <InlineList>
          <li>Clique em <strong className="text-foreground">Registrar venda</strong></li>
          <li>Informe empreendimento, unidade, data, valor da venda e percentual de comissão</li>
          <li>A comissão é calculada automaticamente (valor × percentual)</li>
          <li>A venda entra no fluxo de aprovação (kanban)</li>
          <li>Após aprovada, aparece na seção de pagamento pendente</li>
          <li>Clique em <strong className="text-foreground">Marcar como paga</strong> para finalizar</li>
        </InlineList>
      </Section>

      {/* 6. Custos */}
      <Section title="6. Custos">
        <SubSection title="Categorias de custo">
          <p>Acesse pelo menu <strong className="text-foreground">Categorias de custo</strong>. Cadastre categorias como Plano de saúde, Vale alimentação ou Seguro de vida para classificar os custos manuais.</p>
        </SubSection>

        <SubSection title="Demonstrativo mensal">
          <p>Acesse pelo menu <strong className="text-foreground">Custos</strong>. O relatório agrega automaticamente:</p>
          <InlineList>
            <li><strong className="text-foreground">Salário base</strong> — do cadastro do colaborador</li>
            <li><strong className="text-foreground">Provisão 13º</strong> — salário ÷ 12 por mês</li>
            <li><strong className="text-foreground">Provisão Férias</strong> — salário ÷ 12 por mês</li>
            <li><strong className="text-foreground">Provisão 1/3 Férias</strong> — (salário ÷ 12) ÷ 3 por mês</li>
            <li><strong className="text-foreground">Benefícios manuais</strong> — custos recorrentes vinculados ao colaborador</li>
            <li><strong className="text-foreground">Comissões pagas</strong> — comissões marcadas como pagas no mês</li>
            <li><strong className="text-foreground">Férias concedidas</strong> — dias gozados no mês</li>
          </InlineList>
        </SubSection>

        <SubSection title="Vincular custo manual">
          <p>Clique em <strong className="text-foreground">Vincular custo</strong>, selecione o colaborador, a categoria, o valor e marque <strong className="text-foreground">Recorrente</strong> se o custo se repete todo mês.</p>
        </SubSection>
      </Section>

      {/* 7. Documentos */}
      <Section title="7. Documentos">
        <SubSection title="Tipos de documento">
          <p>Acesse pelo menu <strong className="text-foreground">Tipos de documento</strong>. Cadastre os tipos aceitos (ex: Contrato Social, RG). Marque <strong className="text-foreground">Exige vencimento</strong> se o documento expira.</p>
        </SubSection>

        <SubSection title="Upload">
          <p>Na edição do colaborador, seção <strong className="text-foreground">Documentos</strong>:</p>
          <InlineList>
            <li>Clique em <strong className="text-foreground">Enviar documento</strong></li>
            <li>Arraste o arquivo ou clique para selecionar (PDF, Word, Excel, Imagens)</li>
            <li>Selecione o tipo e informe a data de vencimento (opcional)</li>
            <li>Documentos com vencimento próximo exibem badges de alerta (Vencido ou Expira)</li>
          </InlineList>
        </SubSection>
      </Section>

      {/* 8. Notas Fiscais */}
      <Section title="8. Notas Fiscais">
        <p>Acesse pelo menu <strong className="text-foreground">Notas Fiscais</strong>.</p>

        <SubSection title="Envio">
          <InlineList>
            <li>Clique em <strong className="text-foreground">Enviar nota fiscal</strong></li>
            <li>Informe competência (ex: <Code>2026-06</Code>), número, valor e data de emissão</li>
            <li>Selecione o arquivo da nota (PDF ou imagem)</li>
            <li>A NF entra automaticamente no fluxo de aprovação</li>
          </InlineList>
        </SubSection>

        <SubSection title="Kanban de aprovação">
          <p>As NFs são organizadas por etapa do fluxo. Cada card mostra o colaborador, número da NF e competência. Use os botões <strong className="text-foreground">Aprovar</strong> ou <strong className="text-foreground">Reprovar</strong> em cada card. O botão <strong className="text-foreground">Download</strong> permite visualizar o arquivo da nota.</p>
        </SubSection>
      </Section>

      {/* 9. Exames */}
      <Section title="9. Exames Periódicos">
        <p>Na edição do colaborador, seção <strong className="text-foreground">Exames periódicos</strong>:</p>
        <InlineList>
          <li>Clique em <strong className="text-foreground">Registrar exame</strong></li>
          <li>Informe o tipo (ex: ASO, Audiometria), data de realização e vencimento</li>
          <li>Anexe um arquivo (opcional) e adicione observações</li>
          <li>Exames vencidos aparecem com badge vermelho; próximos do vencimento, badge amarelo</li>
        </InlineList>
      </Section>

      {/* 10. Perfis */}
      <Section title="10. Perfis e Permissões">
        <p>Acesse pelo menu <strong className="text-foreground">Perfis</strong>.</p>
        <InlineList>
          <li><strong className="text-foreground">Administrador</strong> — acesso total ao sistema</li>
          <li><strong className="text-foreground">RH</strong> — gerencia colaboradores, férias, documentos, NFs, exames e custos</li>
          <li><strong className="text-foreground">Financeiro</strong> — gerencia comissões e custos</li>
          <li><strong className="text-foreground">Gestor</strong> — aprova solicitações da sua equipe</li>
          <li><strong className="text-foreground">Colaborador</strong> — envia solicitações e NFs, visualiza seus próprios dados</li>
        </InlineList>
        <p>Para criar um novo perfil, selecione as permissões desejadas na lista de toggles agrupados por contexto.</p>
      </Section>

      {/* 11. Workflows */}
      <Section title="11. Workflows">
        <p>Acesse pelo menu <strong className="text-foreground">Workflows</strong>. Configure as etapas de aprovação para cada tipo de processo:</p>
        <InlineList>
          <li><strong className="text-foreground">Aprovação de Férias</strong></li>
          <li><strong className="text-foreground">Aprovação de Comissão</strong></li>
          <li><strong className="text-foreground">Aprovação de Nota Fiscal</strong></li>
        </InlineList>
        <p>Cada etapa define um nome, uma ordem e um responsável (cargo ou usuário específico).</p>
      </Section>

      {/* 12. Relatórios */}
      <Section title="12. Relatórios">
        <p>Acesse pelo menu <strong className="text-foreground">Relatórios</strong>. Quatro tipos em abas:</p>
        <InlineList>
          <li><strong className="text-foreground">Colaboradores</strong> — filtrar por nome</li>
          <li><strong className="text-foreground">Férias</strong> — filtrar por status (pendente, aprovada, reprovada)</li>
          <li><strong className="text-foreground">Notas Fiscais</strong> — filtrar por status</li>
          <li><strong className="text-foreground">Exames</strong> — filtrar por vencidos ou válidos</li>
        </InlineList>
        <p>Após aplicar os filtros, você pode exportar em <strong className="text-foreground">PDF</strong> ou <strong className="text-foreground">Excel</strong> usando os botões no canto superior direito. O nome do arquivo inclui o tipo de relatório e a data atual.</p>
      </Section>

      {/* 13. Auditoria */}
      <Section title="13. Auditoria">
        <p>Acesse pelo menu <strong className="text-foreground">Auditoria</strong>. Registro automático de todas as alterações:</p>
        <InlineList>
          <li><span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Criado</span> — registro inserido</li>
          <li><span className="inline-flex items-center rounded-full bg-primary-muted px-2 py-0.5 text-xs font-medium text-primary">Atualizado</span> — registro modificado</li>
          <li><span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Excluído</span> — registro removido</li>
        </InlineList>
        <p>Filtre por tipo de ação. <strong className="text-foreground">Clique em uma linha</strong> para expandir e ver os campos alterados com o valor anterior e o novo valor.</p>
      </Section>

      {/* 14. Notificações */}
      <Section title="14. Notificações por E-mail">
        <p>O sistema envia e-mails automaticamente nos seguintes eventos:</p>
        <InlineList>
          <li>Processo totalmente aprovado</li>
          <li>Processo reprovado (com justificativa)</li>
          <li>Nova etapa para aprovar — quando um processo chega na sua vez</li>
          <li>Confirmação de envio de nota fiscal, solicitação de férias ou venda</li>
          <li>Lembrete diário de documentos próximos do vencimento</li>
          <li>Lembrete diário de exames próximos do vencimento</li>
        </InlineList>
        <p>No ambiente de desenvolvimento, os e-mails são capturados pelo MailHog em <Code>http://localhost:8025</Code>. Em produção, configure as credenciais SMTP no arquivo <Code>.env</Code>.</p>
      </Section>

      {/* 15. Tabela de permissões */}
      <Section title="15. Tabela de Permissões">
        <PermTable />
      </Section>
    </div>
  )
}
