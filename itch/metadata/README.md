# itch.io metadata

Guarda aquí la ficha de cada juego: descripción, controles, tags, idiomas,
capturas y checklist de publicación.

Genera el build con:

```bash
npm run itch:package
```

El ZIP queda en `itch/output/` y se puede revisar con:

```bash
npm run itch:preview
```

Activa en itch.io la opción “This file will be played in the browser”. El
paquete usa rutas relativas y no necesita servidor propio.
