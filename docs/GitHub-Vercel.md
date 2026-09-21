# Tales of Moonie: proyecto portátil

El mismo código mantiene dos vías independientes. `.openai/hosting.json` identifica el alojamiento existente y no se modifica.

## Ejecutar en tu computadora (Windows, macOS o Linux)

Instala Node.js 22.13 o posterior y Git. Descomprime el paquete y abre una terminal en la carpeta que contiene `package.json`.

```sh
npm ci
npm run dev:vercel
```

Abre la dirección local que indique Next.js. Para verificar producción:

```sh
npm run build:vercel
npm run start:vercel
```

No requiere claves, base de datos, cuenta de jugadora ni servicios de ChatGPT. Los recursos están en `public/assets`; los sonidos se generan localmente en el navegador. El navegador puede requerir un clic para habilitar audio.

## Subir a tu GitHub

Crea un repositorio **privado**, vacío, sin README ni licencia inicial. El ZIP contiene archivos personales del regalo. No incluye `.git`, credenciales, dependencias instaladas ni cachés. Desde la carpeta descomprimida:

```sh
git init -b main
git add .
git commit -m "Import Tales of Moonie"
git remote add origin URL_HTTPS_DE_TU_REPOSITORIO
git push -u origin main
```

Sustituye `URL_HTTPS_DE_TU_REPOSITORIO` por la URL que muestre GitHub. Si continúas un repositorio ya creado, usa una rama y revisa el diff; no vuelvas a inicializarlo ni sobrescribas cambios.

## Vercel

En Vercel, importa ese repositorio y selecciona Next.js. La configuración incluida establece `npm ci` y `npm run build:vercel`. Usa Node.js 22.x y conserva el directorio de salida predeterminado de Next.js. No añadas variables de entorno: este juego no las necesita.

La publicación en Vercel se realiza desde tu cuenta y requiere tu aprobación. El repositorio privado no hace privada automáticamente la página desplegada: revisa el acceso en Vercel antes de compartirla. La etiqueta `noindex` evita solicitar indexación, pero no sustituye un control de acceso.

Los comandos tradicionales `npm run dev`, `npm run build` y `npm run start` siguen destinados a Sites/Vinext. Los comandos con sufijo `:vercel` utilizan Next.js directamente y funcionan también en Windows, sin los scripts Bash del entorno Sites.

## Continuar con otro editor o asistente

Empieza por `docs/Documento-Maestro.md`, las decisiones recientes y el informe de revisión estética. El juego está en `app/game`. Conserva los textos aprobados en `story.ts`; no cambies la fecha de la carta. Trabaja en una rama, compara los cambios y no publiques sin revisar el recorrido completo.

```sh
git switch -c correccion-estetica
npm run build:vercel
npm run test:game
```

Las auditorías gráficas opcionales usan `@napi-rs/canvas`, disponible en el entorno de desarrollo original. Las pruebas del motor se separan de las herramientas de renderizado para que las comprobaciones ordinarias no dependan de esa biblioteca opcional.

## Referencias oficiales

- https://vercel.com/docs/project-configuration/vercel-json
- https://nextjs.org/docs/app/api-reference/config/next-config-js/typescript

El paquete es código fuente editable; no se ejecuta abriendo un HTML mediante doble clic. Debe servirse con los comandos anteriores o desplegarse.
