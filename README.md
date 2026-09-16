# Game starter

Plantilla de GameBob para crear juegos pequeños con un único runtime y cuatro
salidas: web, itch.io, Capacitor y Electron. El juego de ejemplo es deliberadamente
simple: sirve como smoke test y como punto de partida para sustituir la lógica.

## Crear un juego nuevo

Clona o copia esta carpeta en un repositorio vacío y ejecuta:

```bash
npm run init -- --name "Mi juego" --slug mi-juego --app-id com.gamebob.mi-juego
npm install
npm run dev
```

`init` actualiza el nombre, slug, versión de identidad, app id de Capacitor y
metadatos de Electron. Usa slugs en minúsculas separados por guiones.

## Flujo diario

```bash
npm run dev       # desarrollo web
npm run check     # TypeScript
npm run test      # pruebas unitarias
npm run build     # build estático para web
npm run qa        # check + tests + build
```

El build web vive en `dist/` y se puede desplegar en cualquier hosting estático.
Vite usa `base: "./"`, así que el mismo build funciona dentro de una ruta o de
un archivo empaquetado.

## itch.io

```bash
npm run itch:package
npm run itch:preview
```

Esto crea `itch/output/<slug>-v<version>-itch.zip`, copia únicamente el build
estático y deja las rutas relativas listas para HTML5 en itch.io.

## Electron

```bash
npm run electron:dev
npm run electron:dist
```

`electron:dev` abre el servidor Vite en una ventana nativa. `electron:dist`
genera instaladores en `release/` para Windows, macOS o Linux según el sistema
desde el que se ejecute.

## Capacitor

Instala las plataformas nativas solo cuando las necesites:

```bash
npm run cap:add:android
npm run cap:add:ios
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

Android requiere Android Studio y SDK; iOS requiere macOS y Xcode. Las carpetas
`android/` e `ios/` son generadas y no se guardan en esta plantilla.

## Dónde trabajar

- `src/game/game.ts`: ciclo de juego, input y render del prototipo.
- `src/game/game-config.ts`: identidad reutilizada por web, itch, Electron y móvil.
- `src/platform.ts`: adaptador común para guardar, compartir, vibración y fullscreen.
- `src/main.ts`: punto de montaje del juego.
- `electron/`: proceso principal y preload aislado.
- `itch/metadata/`: documentación de publicación y checklist por juego.

Para un juego real, conserva `GamePlatform` y reemplaza `Game` por un engine o
un paquete independiente. Así la lógica no conoce Astro, Electron ni Capacitor,
igual que el runtime distribuible de Axon Surge.
