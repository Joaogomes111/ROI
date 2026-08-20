# Diagnostico Simples Nacional Hibrido | ROI Contabilidade

Landing page interativa para diagnosticar se uma empresa precisa avaliar a adesao ao Simples Nacional Hibrido.

## O que tem no projeto

- Pagina responsiva com identidade visual da ROI Contabilidade
- Questionario com pontuacao e diagnostico final
- Formulario de lead com nome, empresa, email, WhatsApp, CNPJ e cargo
- Botao de WhatsApp com mensagem pre-preenchida
- Envio dos leads para Google Sheets e RD Station via rota segura no backend
- Google Analytics 4 configurado com a tag `G-72KFD3RXMX`
- Meta Pixel preparado para marcar o evento `Lead` no envio do cadastro

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

## Variaveis de ambiente

Configure os destinos em `.env.local` no ambiente local e em `Settings > Environment Variables` na Vercel.

```bash
GOOGLE_SHEETS_WEBHOOK_URL=
RD_STATION_API_KEY=
RD_STATION_CONVERSION_IDENTIFIER=Diagnostico Simples Nacional Hibrido
RD_STATION_TAGS=diagnostico-simples-hibrido,roi-contabilidade
RD_FIELD_CNPJ=
RD_FIELD_RESULT_PERCENTAGE=
RD_FIELD_RESULT_BAND=
NEXT_PUBLIC_META_PIXEL_ID=1035841049088530
```

`GOOGLE_SHEETS_WEBHOOK_URL` mantem a planilha como backup. `RD_STATION_API_KEY` envia o lead direto para o RD Station. `NEXT_PUBLIC_META_PIXEL_ID` carrega o Meta Pixel e marca o evento `Lead` quando o cadastro e concluido. As variaveis `RD_FIELD_*` sao opcionais e devem receber o `api_identifier` dos campos personalizados criados na RD.

## Google Sheets

O formulario envia os leads para `/api/leads`. Essa rota usa a variavel de ambiente `GOOGLE_SHEETS_WEBHOOK_URL` para encaminhar os dados ao Google Apps Script.

1. Crie uma planilha no Google Sheets.
2. Abra `Extensoes > Apps Script`.
3. Use o codigo em `docs/google-sheets-apps-script.gs`.
4. Publique como aplicativo da Web.
5. Configure a URL publicada na Vercel em `GOOGLE_SHEETS_WEBHOOK_URL`.

A aba `Leads` fica enxuta para importacao no RD Station, com estes campos:

- Data de conversao
- Nome
- Empresa
- Email
- WhatsApp
- CNPJ
- Cargo
- Resultado %
- Faixa do diagnostico
- Origem

## RD Station

O mesmo envio para `/api/leads` tambem dispara uma conversao para o RD Station quando `RD_STATION_API_KEY` esta configurada.

1. No RD Station Marketing, gere uma API Key para integracoes de conversao.
2. Na Vercel, adicione `RD_STATION_API_KEY` em Production, marcada como Sensitive.
3. Opcionalmente ajuste `RD_STATION_CONVERSION_IDENTIFIER` para o nome da conversao que aparecera na linha do tempo do lead.
4. Se quiser levar CNPJ, percentual e faixa para campos personalizados da RD, crie esses campos na RD e preencha `RD_FIELD_CNPJ`, `RD_FIELD_RESULT_PERCENTAGE` e `RD_FIELD_RESULT_BAND` com os respectivos `api_identifier`.
5. Suba os arquivos para o GitHub e aguarde novo deploy da Vercel.

Campos padrao enviados para a RD:

- Nome
- Email
- Empresa
- Cargo
- WhatsApp como celular
- Origem de trafego
- Tags do diagnostico
- Base legal de consentimento para comunicacoes

## Meta Ads

Para campanhas de leads no Meta usando o site como destino, configure o Pixel/Dataset no Gerenciador de Eventos e adicione o ID em `NEXT_PUBLIC_META_PIXEL_ID` na Vercel.

1. No Meta Events Manager, crie ou selecione uma fonte de dados Web.
2. Copie o ID do Pixel/Dataset.
3. Na Vercel, adicione `NEXT_PUBLIC_META_PIXEL_ID` em Production.
4. Suba os arquivos para o GitHub e aguarde novo deploy.
5. No Events Manager, use Test Events, abra o site e envie um cadastro de teste.

O site envia `PageView` ao carregar a pagina e `Lead` apenas depois do cadastro valido do diagnostico.
