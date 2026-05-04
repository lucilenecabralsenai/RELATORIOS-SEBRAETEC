# Gerador de Relatórios SEBRAETEC

Aplicação web com React + Node.js/Express para preencher e gerar relatórios `.docx` a partir do arquivo modelo `RELATÓRIO - JM CONFECÇÕES.docx`.

## Como funciona

- Front-end: formulário completo com dados de projeto, empresa, consultor, etapas, datas, plano de ação, assinaturas e registro fotográfico.
- Back-end: endpoint `POST /api/gerar-relatorio` que usa `docxtemplater` + módulo de imagem para renderizar o `.docx` preservando layout do modelo (logos, cabeçalho, tabelas, rodapé e páginas especiais).

## Pré-requisitos

- Coloque o arquivo **`RELATÓRIO - JM CONFECÇÕES.docx`** na raiz do projeto.
- O `.docx` deve conter tags do docxtemplater (ex.: `{projeto}`, `{empresa}`, loops de etapas/fotos etc.).

## Executar

```bash
npm install
npm run dev
```

Front-end em `http://localhost:5173` e API em `http://localhost:3001`.
