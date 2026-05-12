# Pupeter — Microserviço Gerador de PDF

Microserviço HTTP para geração de PDFs A4 a partir de HTML. Utiliza [Gotenberg](https://gotenberg.dev) como motor de renderização (Chromium gerenciado externamente), exposto via [Fastify](https://fastify.dev).

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/)
- Node.js 22+ e pnpm 10 (apenas para desenvolvimento local)

## Subindo com Docker

```bash
docker compose up -d --build
```

Isso sobe dois containers:

| Container | Porta | Descrição |
|---|---|---|
| `pupeter-api` | `3333` | A API Fastify |
| `pupeter-gotenberg` | — | Gotenberg (interno, sem porta exposta) |

A API só inicia após o Gotenberg estar saudável.

## Endpoints

Todos os endpoints aceitam `Content-Type: application/json` e retornam um arquivo PDF (`application/pdf`).

### `POST /pdf/document`

Gera um PDF de documento oficial, sem marca d'água.

```bash
curl -X POST http://localhost:3333/pdf/document \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Contrato</h1><p>Conteúdo do documento.</p>"}' \
  --output documento.pdf
```

### `POST /pdf/preview`

Gera uma pré-visualização com marca d'água **PREVIEW** em diagonal.

```bash
curl -X POST http://localhost:3333/pdf/preview \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Contrato</h1><p>Conteúdo do documento.</p>"}' \
  --output preview.pdf
```

### `POST /pdf/model`

Gera um modelo de documento com marca d'água **MODELO** em diagonal. O cabeçalho exibe "Modelo de Documento" em vez da data.

```bash
curl -X POST http://localhost:3333/pdf/model \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Modelo</h1><p>Conteúdo do modelo.</p>"}' \
  --output modelo.pdf
```

**Body:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `htmlContent` | `string` | sim | HTML do corpo do documento (sem `<html>`, `<head>` ou `<body>`) |

**Respostas:**

| Status | Descrição |
|---|---|
| `200` | PDF gerado com sucesso |
| `400` | `htmlContent` ausente |
| `429` | Rate limit atingido (6 req/min por IP) |
| `500` | Falha na geração |

## Layout do PDF

Todos os PDFs são gerados em **A4** com:

- **Cabeçalho:** título do documento à esquerda, data por extenso em português à direita
- **Rodapé:** "Imob Gestão © ANO" à esquerda (exceto modelo), "Página X de Y" à direita
- **Margens:** 25 mm superior/inferior, 20 mm laterais

## Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Iniciar em modo watch
pnpm dev
```

Variáveis de ambiente (`.env`):

```env
PORT=3333
GOTENBERG_URL=http://localhost:3000
```

Para desenvolvimento local, suba o Gotenberg separadamente:

```bash
docker run --rm -p 3000:3000 gotenberg/gotenberg:8
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3333` | Porta do servidor |
| `GOTENBERG_URL` | `http://localhost:3000` | URL base do Gotenberg |
