# Design System — Vulcano

## Princípios

- **Sem gradientes** em componentes
- **Sem bordas** (`border`) para delimitar superfícies
- Contornos definidos por **sombras** e **contraste de cor** entre superfícies

## Tipografia

- Fonte: **Inter** (400, 500, 600, 700)
- Configurada em `index.html` e `--font-sans` em `src/index.css`

## Tokens de cor

| Token | Valor | Psicologia / uso |
|-------|-------|------------------|
| `primary` | `#9d00ff` | Inovação, sofisticação, visão estratégica |
| `secondary` | `#0e7490` | Confiança, clareza, estabilidade (contrapeso ao violeta) |
| `accent` | `#b45309` | Atenção pontual sem alarmismo |
| `success` | `#059669` | Confirmação, crescimento |
| `warning` | `#ca8a04` | Cautela |
| `danger` | `#dc2626` | Erro e ações destrutivas |
| `background` | `#f4f2f7` | Base neutra com subtom violeta |
| `surface` | `#ffffff` | Superfícies elevadas |
| `surface-sunken` | `#ebe8f0` | Inputs e áreas rebaixadas |
| `foreground` | `#1a1625` | Texto principal |

## Elevação (sombras)

| Token | Uso |
|-------|-----|
| `shadow-surface` | Header, alertas, botões |
| `shadow-raised` | Inputs em foco |
| `shadow-overlay` | Cards e painéis |
| `shadow-inset` | Inputs e botões ghost |

## Componentes base

Localizados em `src/components/ui/`:

- `Button` — variantes: `primary`, `secondary`, `ghost`
- `Input` — fundo rebaixado + sombra interna
- `Card` — painel elevado sem borda
- `Alert` — variantes semânticas com contraste de fundo
- `AuthLayout` / `PageLayout` — estruturas de página

## Uso com Tailwind

```tsx
<div className="bg-surface shadow-overlay rounded-xl">
  <button className="bg-primary text-primary-foreground shadow-surface">
    Ação
  </button>
</div>
```
