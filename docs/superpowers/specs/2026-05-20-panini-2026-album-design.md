# Diseno de la app para album Panini Mundial 2026

## Meta

Crear una aplicacion web personal para registrar el avance del album Panini del Mundial 2026. La app sera local-first, correra desde esta carpeta y guardara el progreso en el navegador. Si el usuario quiere usarla en otra computadora, copiara la app manualmente e importara un respaldo de progreso.

## Fuente de datos

La base inicial de stickers se debe extraer de `https://paniniwm2026sticker.com/`, tratandola como la fuente mas confiable del checklist. La app usara un snapshot local generado desde esa fuente y no dependera del sitio en tiempo de ejecucion.

El extractor debe generar `src/data/stickers.json` con el checklist completo que exponga la fuente. El objetivo inicial es capturar la coleccion indicada por el sitio: alrededor de 980 stickers, 48 equipos, 20 stickers por equipo y stickers especiales.

El extractor tambien debe generar un reporte de validacion con:

- Total de stickers.
- Cantidad de stickers por equipo.
- Codigos duplicados.
- Stickers sin nombre.
- Stickers sin URL de imagen.
- Cracks que no pudieron vincularse a un sticker.

Si la fuente esta renderizada dinamicamente, el extractor puede usar HTML, JSON embebido, bundles JavaScript publicos o un snapshot capturado. El resultado final para la app siempre sera un dataset local estable.

## Producto

Usar Vite + React + TypeScript con interfaz en espanol. La primera pantalla sera el dashboard utilizable, no una landing page.

La app tendra estas pantallas:

- Dashboard: avance global, faltantes, repetidas, avance de cracks, ultimos cambios y tabla de avance por equipo.
- Album: catalogo completo con busqueda y filtros por equipo, grupo, categoria, rareza, estado, repetida y crack.
- Equipo: vista enfocada en un pais, con avance del equipo, avance de cracks, especiales y jugadores.
- Repetidas: lista de stickers repetidos agrupados para intercambio.
- Faltantes: lista de stickers faltantes, filtrable y exportable.
- Ajustes: exportar/importar respaldo, reiniciar progreso local y ver version del dataset.

Cada sticker se mostrara como una tarjeta compacta con codigo, equipo, nombre del jugador o sticker, categoria, rareza, estado de obtenido, cantidad de repetidas, marca de crack si aplica y miniatura. Si la imagen no carga, se mostrara un placeholder estable con el codigo.

## Modelo de datos

El dataset de stickers sera informacion de solo lectura incluida con la app. Cada sticker debe incluir:

- `id`
- `code`
- `team`
- `group`
- `number`
- `category`
- `rarity`
- `name`
- `isCrack`
- `imageUrl`
- `sourceUrl`

El progreso personal vivira separado del dataset. Cada registro personal debe incluir:

- `owned`
- `duplicates`
- `notes`
- `updatedAt`

Los respaldos exportaran solo el progreso personal y metadatos de version del dataset. El dataset completo seguira incluido con la app.

## Cracks

La app incluira una lista fija de cracks por equipo. Esa lista debe vivir en un archivo mantenible, por ejemplo `src/data/cracks.ts`, y cada crack se vinculara al dataset por codigo o por nombre/equipo normalizados.

El dashboard y la vista de equipo mostraran:

- Avance total de cracks.
- Avance de cracks por equipo.
- Cracks faltantes.
- Cracks definidos que no se pudieron vincular a un sticker.

## Imagenes

Las imagenes se manejaran como URLs web externas guardadas en el dataset cuando se encuentren. La app renderizara esas URLs directamente y no descargara, empaquetara ni redistribuira archivos de imagen.

La carga de imagenes no debe bloquear la app. URLs faltantes, bloqueadas o vencidas caeran a placeholders y no afectaran el seguimiento del progreso.

## Persistencia local

Usar `localStorage` para el MVP. La persistencia debe quedar detras de un modulo pequeno para poder migrarla a IndexedDB si el proyecto crece.

El modulo de persistencia debe soportar:

- Cargar el progreso actual.
- Marcar o desmarcar un sticker como obtenido.
- Incrementar, disminuir o fijar la cantidad de repetidas.
- Guardar notas opcionales.
- Exportar respaldo JSON.
- Importar respaldo JSON.
- Reiniciar progreso local.

## Calculos

La logica de progreso debe vivir en funciones puras para facilitar pruebas. Calculos requeridos:

- Porcentaje de avance global.
- Totales de obtenidas, faltantes y repetidas.
- Avance por equipo.
- Avance por categoria y rareza.
- Avance de cracks global y por equipo.
- Lista de faltantes.
- Lista de repetidas.

Las repetidas se cuentan por separado del estado de obtenido. Un sticker puede estar obtenido con cero repetidas u obtenido con una o mas repetidas. Si la cantidad de repetidas queda por encima de cero, la app puede inferir `owned = true`.

## Manejo de errores

La app debe seguir siendo util aunque falten datos no criticos:

- Imagenes faltantes muestran placeholders.
- Nombres faltantes usan codigo y categoria como respaldo.
- Errores de importacion muestran un mensaje claro en espanol y no sobrescriben el progreso existente.
- Advertencias de validacion del dataset se muestran durante desarrollo, pero no bloquean el uso normal salvo que el dataset no pueda cargar.

## Pruebas y verificacion

Agregar pruebas enfocadas para:

- Calculos de progreso.
- Calculos de avance por equipo.
- Vinculacion y avance de cracks.
- Generacion de listas de repetidas y faltantes.
- Ciclo completo de import/export.
- Reglas de validacion del dataset.

Antes de considerar completo el MVP, ejecutar la suite de pruebas y un build de produccion.

## Fuera de alcance del MVP

- Cuentas o sincronizacion en la nube.
- Backend o base de datos de servidor.
- Actualizacion en tiempo real desde el sitio fuente.
- Carga manual de imagenes al almacenamiento local.
- Gestion de personas para intercambio.
- Empaquetado como app movil.

