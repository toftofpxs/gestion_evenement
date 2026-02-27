- [ ] Trouver mon IPv4
- [ ] Modifier CORS dans src/index.js
- [ ] Ouvrir port 4000 sur le pare-feu
- [ ] Tester /health depuis mobile
- [ ] Tester /api/events depuis mobile

### Étape 4 — Écoute réseau (smartphone)

Dans `src/index.js`, mets cette ligne :

```js
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on 0.0.0.0:${PORT}`));
```