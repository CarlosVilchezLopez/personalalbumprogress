# Intercambios entre coleccionistas — Design Spec

**Date:** 2026-05-21
**Status:** Approved (pending plan)

## Goal

Permitir que dos coleccionistas intercambien sus listas de repetidas y faltantes vía JSON, y que la app sugiera intercambios priorizados por tipo de carta y por selección.

## User flow

1. Carlos abre `/intercambios`, ve sus contadores (repes, faltantes). Hace clic en **Descargar JSON** o **Copiar al portapapeles** y manda el archivo/texto a Juan por WhatsApp.
2. Juan hace lo mismo desde su instancia de la app y le devuelve su JSON a Carlos.
3. Carlos pega el JSON de Juan en el textarea (o sube su archivo). La app valida, calcula matches bidireccionales y los muestra agrupados por bucket.
4. Carlos revisa qué stickers le conviene darle a Juan y cuáles pedirle a cambio.

## JSON payload

Formato mínimo, intercambiado por chat o archivo `.json`:

```json
{
  "type": "panini-2026-trade-list",
  "datasetVersion": "<actual>",
  "exportedAt": "2026-05-21T20:55:00Z",
  "owner": "Carlos",
  "repes": ["BRA1", "ARG3", "MEX17"],
  "faltantes": ["URU2", "COL4"]
}
```

Campos:

- `type` — discriminador. Importer rechaza si no coincide.
- `datasetVersion` — viene de `src/data/datasetMeta.ts`. Si difiere del local al importar, banner warning pero permite continuar.
- `exportedAt` — ISO timestamp.
- `owner` — string libre. Nombre mostrado en UI de matches. Opcional.
- `repes` — array de `sticker.code` con `collection[code].duplicates >= 1`.
- `faltantes` — array de `sticker.code` que existen en dataset pero `collection[code].owned === false` (o no existen en collection).

## Match logic

Bidireccional. Dos listas resultado:

- **Le doy** = `mis_repes ∩ sus_faltantes`
- **Recibo** = `sus_repes ∩ mis_faltantes`

Cada match se asigna a un bucket por prioridad (de más afín a menos):

1. **Cracks** — `sticker.isCrack === true`. Bucket único transversal a todos los equipos.
2. **Escudos** — `sticker.category === "Team Badge"`.
3. **Fotos de equipo** — `sticker.category === "Team Photo"`.
4. **Jugadores por equipo** — `sticker.category === "Player"`. Sub-agrupados por `sticker.team` (ej: "Jugadores Brasil", "Jugadores Argentina").
5. **Brand / Emblem** — `sticker.category === "Brand / Emblem"` (y cualquier categoría futura no contemplada arriba).

UI muestra buckets en ese orden. Para "Jugadores por equipo", los sub-buckets se ordenan alfabéticamente por team.

## Architecture

### Archivos nuevos

- `src/domain/trade.ts`
  - `buildTradeList(collection, stickers): TradeListPayload`
  - `matchTrades(mine, friend, stickers): { iGive: TradeBucket[]; iReceive: TradeBucket[] }`
  - Funciones puras, sin DOM, sin `localStorage`.
- `src/domain/trade.test.ts` — unit tests.
- `src/storage/tradeList.ts`
  - `exportTradeListJson(datasetVersion, owner): string`
  - `parseTradeListJson(json): TradeListPayload` (lanza Error con mensaje legible).
- `src/pages/IntercambiosPage.tsx` — UI.
- `src/pages/IntercambiosPage.test.tsx` — page test (render matches a partir de JSON importado).
- `src/components/TradeBucket.tsx` — sección colapsable (`<details>`) por bucket con lista de stickers.

### Archivos tocados

- `src/App.tsx` — registrar ruta `/intercambios` + link en navegación.
- `src/domain/types.ts` — agregar:
  - `TradeListPayload`
  - `TradeBucket` (`{ key: string; label: string; stickers: Sticker[] }`)
  - `TradeMatchResult` (`{ iGive: TradeBucket[]; iReceive: TradeBucket[] }`)

### Flujo de datos

**Export:**
```
loadCollection()
  → buildTradeList(collection, STICKERS)
  → JSON.stringify
  → [Blob download | navigator.clipboard.writeText]
```

**Import + match:**
```
textarea/file → parseTradeListJson(json)
  → matchTrades(myList, friendList, STICKERS)
  → renderiza TradeBucket[] (iGive) y TradeBucket[] (iReceive)
```

Estado en página: `useState<TradeListPayload | null>` para friend list + `useMemo` para matches. No persiste; sesión efímera.

## Error handling

Casos cubiertos al importar:

- JSON malformado → mensaje "Formato inválido".
- Falta `type === "panini-2026-trade-list"` → mensaje "Archivo no es lista de intercambio Panini 2026".
- `datasetVersion` distinto al local → banner amarillo warning, NO bloquea.
- Códigos en JSON amigo que no existen en dataset local → filtrados silenciosamente.
- `repes` o `faltantes` no son arrays de string → rechaza.

## Testing

- `buildTradeList`: filtra repes (`duplicates >= 1`), filtra faltantes (`!owned`).
- `matchTrades`:
  - bucket asignado por categoría correcta.
  - cracks van a bucket Cracks aunque categoría sea "Player".
  - jugadores agrupados por team.
  - orden de buckets respeta prioridad definida.
  - retorna listas vacías cuando no hay intersección.
- `parseTradeListJson`:
  - rechaza JSON malformado.
  - rechaza `type` incorrecto.
  - acepta payload válido.
- Page test: pega JSON válido → render muestra al menos un bucket con stickers esperados.

## Out of scope (YAGNI)

- No persistencia de listas importadas entre sesiones.
- No QR para compartir.
- No notificación cuando amigo "actualiza" su lista.
- No autenticación / multi-usuario.
- No comentarios por intercambio.
- No control de umbral mínimo de repes (todas las repes con count >= 1 son candidatas).
