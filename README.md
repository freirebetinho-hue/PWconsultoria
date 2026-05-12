# SMS – Grupo Kallas

Site estático para apresentar a estrutura técnica e operacional do GPT **SMS – Grupo Kallas**, um Safety Operations Agent focado em SST, SGA, emergências, investigação, PGR/GRO e gestão documental GCD.

## Estrutura

- `index.html`: shell HTML, metadados e carregamento dos assets.
- `styles.css`: identidade visual, responsividade e componentes.
- `app.js`: renderização das seções, dados do conteúdo, menu mobile e demo de chat operacional.

## Como executar localmente

```bash
python3 -m http.server 4173
```

Depois acesse `http://127.0.0.1:4173/index.html`.
