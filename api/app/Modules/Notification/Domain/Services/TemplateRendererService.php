<?php

namespace App\Modules\Notification\Domain\Services;

use App\Modules\Notification\Domain\Models\NotificationTemplate;

class TemplateRendererService
{
    /**
     * Built-in variables derived from User model fields.
     * key => [label, source_path_for_data_get]
     *
     * @var array<string, array{string, string}>
     */
    private const BUILT_IN_VARIABLES = [
        'prestador.nome' => ['Nome do prestador', 'prestador.nome'],
        'prestador.email' => ['E-mail', 'prestador.email'],
        'prestador.cargo' => ['Cargo', 'prestador.cargo'],
        'prestador.remuneracao' => ['Remuneração', 'prestador.remuneracao'],
        'prestador.data_contratacao' => ['Data de contratação', 'prestador.data_contratacao'],
        'prestador.modalidade' => ['Modalidade (CLT/PJ)', 'prestador.modalidade'],
        'prestador.cpf' => ['CPF', 'prestador.cpf'],
        'prestador.rg' => ['RG', 'prestador.rg'],
        'prestador.telefone' => ['Telefone', 'prestador.telefone'],
        'prestador.data_nascimento' => ['Data de nascimento', 'prestador.data_nascimento'],

        'prestador.empresa_tomadora' => ['Empresa tomadora', 'prestador.empresa_tomadora'],
        'prestador.dia_emissao_nf' => ['Dia para emissão de NF', 'prestador.dia_emissao_nf'],

        'endereco.cep' => ['CEP', 'endereco.cep'],
        'endereco.rua' => ['Rua', 'endereco.rua'],
        'endereco.numero' => ['Número', 'endereco.numero'],
        'endereco.bairro' => ['Bairro', 'endereco.bairro'],
        'endereco.cidade' => ['Cidade', 'endereco.cidade'],
        'endereco.estado' => ['Estado (UF)', 'endereco.estado'],

        'setor.nome' => ['Setor', 'setor.nome'],
        'gestor.nome' => ['Gestor', 'gestor.nome'],

        'dados_bancarios' => ['Dados bancários', 'dados_bancarios'],
        'contatos_emergencia' => ['Contatos de emergência', 'contatos_emergencia'],
        'observacoes' => ['Observações', 'observacoes'],
        'perfis' => ['Perfis de acesso', 'perfis'],

        'periodo.atual' => ['Período atual (mês/ano)', 'periodo.atual'],
        'periodo.anterior' => ['Período anterior', 'periodo.anterior'],
        'data.atual' => ['Data atual', 'data.atual'],
        'data.limite_nf' => ['Data limite NF', 'data.limite_nf'],
    ];

    /**
     * Render a template with the given context variables.
     *
     * @param  array<string, mixed>  $context
     * @return array{subject: string, body: string}
     */
    public function render(NotificationTemplate $template, array $context): array
    {
        $subject = $this->replaceVariables($template->subject, $context);
        $body = $this->replaceVariables($template->body, $context);

        return [
            'subject' => $subject,
            'body' => $body,
        ];
    }

    /**
     * Render a raw string with variable placeholders.
     *
     * @param  array<string, mixed>  $context
     */
    public function renderString(string $text, array $context): string
    {
        return $this->replaceVariables($text, $context);
    }

    /**
     * Get all available variables as key => label map.
     *
     * @return array<string, string>
     */
    public function getAvailableVariables(): array
    {
        $map = [];

        foreach (self::BUILT_IN_VARIABLES as $key => [$label]) {
            $map[$key] = $label;
        }

        return $map;
    }

    /**
     * Resolve a variable key to its source path.
     */
    private function resolveSource(string $key): ?string
    {
        return self::BUILT_IN_VARIABLES[$key][1] ?? null;
    }

    /**
     * Replace {{ variable.key }} placeholders in text with context values.
     */
    private function replaceVariables(string $text, array $context): string
    {
        return preg_replace_callback(
            '/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/',
            function (array $matches) use ($context): string {
                $key = $matches[1];
                $source = $this->resolveSource($key);

                if (! $source) {
                    return '{{' . $key . '}}';
                }

                return (string) data_get($context, $source, '');
            },
            $text,
        );
    }
}
