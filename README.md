# Gerador de Relatórios SEBRAETEC (Client-side)

Aplicação React que gera relatórios `.docx` totalmente no navegador, sem backend Node/Express, compatível com GitHub Pages.

## Requisitos

1. Coloque o modelo `RELATÓRIO - JM CONFECÇÕES.docx` em `frontend/public/`.
2. Garanta que o `.docx` possua as tags do docxtemplater (campos e loops para etapas/fotos).

## Executar localmente

```bash
npm install
npm run dev
```

## Build para GitHub Pages

```bash
npm run build
```

A pasta de saída será `frontend/dist/`.
