# Diagnostico Simples Nacional Hibrido | ROI Contabilidade

Landing page interativa para diagnosticar se uma empresa precisa avaliar a adesao ao Simples Nacional Hibrido.

## O que tem no projeto

- Pagina responsiva com identidade visual da ROI Contabilidade
- Questionario com pontuacao e diagnostico final
- Formulario de lead com nome, empresa, email, WhatsApp, CNPJ e cargo
- Botao de WhatsApp com mensagem pre-preenchida
- Estrutura preparada para conectar futuramente a uma planilha/endpoint

## Requisitos

- Node.js `>=22.13.0`

## Como rodar localmente

```bash
npm install
npm run dev
```

Depois acesse a URL local exibida no terminal.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Arquivos principais

- `app/page.tsx`: conteudo, perguntas, pontuacao, formulario e resultado
- `app/globals.css`: layout, responsivo, animacoes e identidade visual
- `app/layout.tsx`: metadados da pagina
- `public/`: imagens e favicon

## Proximo passo

Conectar o envio do formulario a uma planilha do Google Sheets ou endpoint intermediario para depois exportar os leads para o RD Station.

## Google Sheets

O formulario envia os leads para `/api/leads`. Essa rota usa a variavel de ambiente `GOOGLE_SHEETS_WEBHOOK_URL` para encaminhar os dados ao Google Apps Script.

1. Crie uma planilha no Google Sheets.
2. Abra `Extensoes > Apps Script`.
3. Use o codigo em `docs/google-sheets-apps-script.gs`.
4. Publique como aplicativo da Web.
5. Configure a URL publicada na Vercel em `GOOGLE_SHEETS_WEBHOOK_URL`.
