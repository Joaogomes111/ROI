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
