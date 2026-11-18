# ctb-prova-web

Frontend statico di prova per claude-teams-bridge: una pagina HTML con JavaScript (moduli ES, nessuna dipendenza) che usa l'API di [ctb-prova-api](https://github.com/pietrocarpinacci-dufercodev/ctb-prova-api).

È il submodule `web/` del meta-repo [ctb-prova-meta](https://github.com/pietrocarpinacci-dufercodev/ctb-prova-meta).

## Struttura

- `src/index.html`, `src/style.css`: la pagina.
- `src/todos.js`: chiamate all'API e logica senza DOM (testabile).
- `src/app.js`: collega la logica alla pagina.
- `tests/`: test con il runner integrato di Node (`node --test`).

L'indirizzo dell'API è `http://localhost:5000`; si cambia impostando `globalThis.CTB_API_BASE` prima di caricare `app.js`.

## Comandi

```bash
npm test     # nessuna dipendenza da installare
npm start    # serve src/ sulla porta 8080
```

## Struttura del repository

- `src/index.html`: la pagina con il form di creazione (titolo e menu della priorità) e l'elenco delle cose da fare.
- `src/style.css`: lo stile della pagina, compresi i colori delle etichette di priorità.
- `src/todos.js`: la logica senza DOM (ordinamento, etichette di priorità, riepilogo) e le chiamate all'API, testabile con Node.
- `src/app.js`: collega `todos.js` alla pagina, disegna l'elenco e gestisce il form e il pulsante "Fatto".
- `tests/todos.test.js`: i test di `todos.js` con il runner integrato di Node.
- `package.json`: gli script `npm test` e `npm start` e la versione minima di Node (20).
- `.gitattributes`, `.gitignore`: la normalizzazione dei fine riga e i file esclusi da Git.
