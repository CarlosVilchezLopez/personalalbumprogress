# Personal Album Progress

Aplicacion web para llevar el progreso personal del album Panini Mundial 2026.
Permite marcar stickers como conseguidos, registrar repetidas, revisar faltantes
por equipo y generar respaldos del avance.

## Funciones

- Dashboard con avance global, faltantes, repetidas y progreso de cracks.
- Vista completa del album con filtros por equipo, grupo, categoria, rareza y estado.
- Vista por equipo para revisar el avance de cada seleccion.
- Lista de stickers repetidos para intercambio.
- Lista de stickers faltantes.
- Respaldo e importacion del progreso personal.
- Respaldos compartidos durante `npm run dev` para sincronizar avances entre la
  computadora y un celular conectado al mismo servidor de desarrollo.

## Persistencia de Datos

El progreso normal se guarda en `localStorage`, por lo que pertenece al navegador
y al origen desde donde se abre la app. Por ejemplo, los datos de
`http://127.0.0.1:5173` no son los mismos que los de un celular abierto desde un
puerto compartido.

Para compartir datos entre dispositivos durante desarrollo, la pagina de
**Ajustes** incluye:

- **Generar respaldo**: crea el respaldo del navegador actual y lo guarda en el
  servidor dev dentro de la carpeta `backups/`.
- **Cargar respaldo**: muestra los respaldos guardados por esa misma instancia
  de `npm run dev` y permite cargarlos en otro navegador o dispositivo.
- **Importar respaldo**: permite pegar manualmente un JSON de respaldo.
- **Reiniciar progreso**: borra el progreso del navegador actual.

Las acciones anteriores piden confirmacion antes de reemplazar o borrar datos.

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalacion

```bash
npm install
```

## Uso en Desarrollo

```bash
npm run dev
```

La app quedara disponible normalmente en:

```text
http://127.0.0.1:5173/
```

Si compartes el puerto desde VS Code/Codex y abres la app desde un celular, ambos
dispositivos pueden usar **Ajustes > Generar respaldo** y **Ajustes > Cargar
respaldo** para pasarse el progreso entre si mientras el mismo servidor dev siga
corriendo.

## Comandos

```bash
npm run dev
npm run build
npm run test
```

Comandos adicionales:

```bash
npm run extract:data
npm run fetch:images
npm run link:cracks
npm run validate:data
```

## Docker

Tambien se incluye una configuracion basica para construir y servir la app con
Docker:

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

La funcion de respaldos compartidos por API esta pensada para `npm run dev`.
