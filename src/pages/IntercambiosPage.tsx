import { useMemo, useState } from "react";
import { TradeBucket } from "../components/TradeBucket";
import { buildTradeList, matchTrades } from "../domain/trade";
import type { CollectionState, Sticker, TradeListPayload } from "../domain/types";
import { exportTradeListJson, parseTradeListJson } from "../storage/tradeList";

type IntercambiosPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  datasetVersion: string;
};

export function IntercambiosPage({ stickers, collection, datasetVersion }: IntercambiosPageProps) {
  const [owner, setOwner] = useState("");
  const [friendJson, setFriendJson] = useState("");
  const [friendList, setFriendList] = useState<TradeListPayload | null>(null);
  const [error, setError] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  const myList = useMemo(
    () => buildTradeList(stickers, collection, datasetVersion, owner),
    [stickers, collection, datasetVersion, owner]
  );

  const matches = useMemo(
    () => (friendList ? matchTrades(myList, friendList, stickers) : null),
    [myList, friendList, stickers]
  );

  function handleDownload() {
    const json = exportTradeListJson(stickers, datasetVersion, owner);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `intercambio-${owner || "anon"}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    const json = exportTradeListJson(stickers, datasetVersion, owner);
    try {
      await navigator.clipboard.writeText(json);
      setCopyMsg("Copiado al portapapeles.");
    } catch {
      setCopyMsg("No se pudo copiar. Usa Descargar JSON.");
    }
  }

  function handleLoad() {
    setError("");
    try {
      const parsed = parseTradeListJson(friendJson);
      setFriendList(parsed);
    } catch (e) {
      setFriendList(null);
      setError(e instanceof Error ? e.message : "Formato inválido");
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setFriendJson(text);
  }

  const datasetMismatch = friendList && friendList.datasetVersion !== datasetVersion;

  return (
    <section className="intercambios-page">
      <h2>Intercambios</h2>

      <section className="intercambios-page__mine">
        <h3>Mi lista</h3>
        <p>
          Repes: {myList.repes.length} · Faltantes: {myList.faltantes.length}
        </p>
        <label>
          Mi nombre (opcional):
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Carlos" />
        </label>
        <div className="intercambios-page__actions">
          <button type="button" onClick={handleDownload}>Descargar JSON</button>
          <button type="button" onClick={() => void handleCopy()}>Copiar al portapapeles</button>
        </div>
        {copyMsg ? <p>{copyMsg}</p> : null}
      </section>

      <section className="intercambios-page__friend">
        <h3>Lista de amigo</h3>
        <textarea
          value={friendJson}
          onChange={(e) => setFriendJson(e.target.value)}
          rows={8}
          placeholder='Pega aquí el JSON de tu amigo'
        />
        <div className="intercambios-page__actions">
          <button type="button" onClick={handleLoad}>Cargar lista</button>
          <input type="file" accept="application/json,.json" onChange={(e) => void handleFile(e)} />
        </div>
        {error ? <p role="alert" className="intercambios-page__error">{error}</p> : null}
      </section>

      {matches && friendList ? (
        <section className="intercambios-page__matches">
          <h3>Intercambios sugeridos</h3>
          <p>
            Amigo: {friendList.owner || "anon"} · Dataset {friendList.datasetVersion}{" "}
            {datasetMismatch ? "(distinto al tuyo)" : "(coincide)"}
          </p>
          {datasetMismatch ? (
            <p role="status" className="intercambios-page__warning">
              Aviso: el amigo usa un dataset distinto. Algunos códigos podrían no coincidir.
            </p>
          ) : null}

          <h4>Le doy ({matches.iGive.reduce((sum, b) => sum + b.stickers.length, 0)})</h4>
          {matches.iGive.length === 0 ? <p>Sin coincidencias.</p> : null}
          {matches.iGive.map((bucket) => (
            <TradeBucket key={`give-${bucket.key}`} bucket={bucket} />
          ))}

          <h4>Recibo ({matches.iReceive.reduce((sum, b) => sum + b.stickers.length, 0)})</h4>
          {matches.iReceive.length === 0 ? <p>Sin coincidencias.</p> : null}
          {matches.iReceive.map((bucket) => (
            <TradeBucket key={`recv-${bucket.key}`} bucket={bucket} />
          ))}
        </section>
      ) : null}
    </section>
  );
}
