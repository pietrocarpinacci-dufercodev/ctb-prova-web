# ctb-prova-web

Frontend statico di prova per claude-teams-bridge: una pagina HTML con JavaScript (moduli ES, nessuna dipendenza) che usa l'API di [ctb-prova-api](https://github.com/pietrocarpinacci-dufercodev/ctb-prova-api).

È il submodule `web/` del meta-repo [ctb-prova-meta](https://github.com/pietrocarpinacci-dufercodev/ctb-prova-meta).

## Struttura

- `src/index.html`, `src/style.css`: la pagina.
- `src/count.html`, `src/count.js`: pagina dedicata che mostra il numero di cose da fare (`GET /api/todos/count`).
- `src/todos.js`: chiamate all'API e logica senza DOM (testabile).
- `src/app.js`: collega la logica alla pagina.
- `tests/`: test con il runner integrato di Node (`node --test`).

L'indirizzo dell'API è `http://localhost:5000`; si cambia impostando `globalThis.CTB_API_BASE` prima di caricare `app.js`.

## Comandi

```bash
npm test     # nessuna dipendenza da installare
npm start    # serve src/ sulla porta 8080
```
