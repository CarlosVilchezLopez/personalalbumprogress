import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AjustesPage } from "./AjustesPage";
import type { SharedBackupService } from "../storage/sharedBackups";

function createService(): SharedBackupService {
  return {
    save: vi.fn().mockResolvedValue({ id: "backup-a.json", createdAt: "2026-05-21T15:30:00.000Z" }),
    list: vi.fn().mockResolvedValue([{ id: "backup-a.json", createdAt: "2026-05-21T15:30:00.000Z" }]),
    load: vi.fn().mockResolvedValue("{\"datasetVersion\":\"v1\",\"collection\":{}}")
  };
}

describe("AjustesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("asks before generating and saving a shared backup", async () => {
    const service = createService();
    render(<AjustesPage onExport={() => "exported-json"} onImport={vi.fn()} onReset={vi.fn()} sharedBackups={service} />);

    fireEvent.click(screen.getByRole("button", { name: "Generar respaldo" }));

    expect(window.confirm).toHaveBeenCalledWith("Esto generara y guardara un respaldo compartido. Deseas continuar?");
    await waitFor(() => expect(service.save).toHaveBeenCalledWith("exported-json"));
    expect(screen.getByRole("textbox")).toHaveValue("exported-json");
  });

  it("does not generate a backup when the user cancels", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    const service = createService();
    const onExport = vi.fn();
    render(<AjustesPage onExport={onExport} onImport={vi.fn()} onReset={vi.fn()} sharedBackups={service} />);

    fireEvent.click(screen.getByRole("button", { name: "Generar respaldo" }));

    expect(onExport).not.toHaveBeenCalled();
    expect(service.save).not.toHaveBeenCalled();
  });

  it("asks before importing typed backup text", () => {
    const onImport = vi.fn();
    render(<AjustesPage onExport={() => ""} onImport={onImport} onReset={vi.fn()} sharedBackups={createService()} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "manual-json" } });
    fireEvent.click(screen.getByRole("button", { name: "Importar respaldo" }));

    expect(window.confirm).toHaveBeenCalledWith("Esto reemplazara el progreso actual con el respaldo pegado. Deseas continuar?");
    expect(onImport).toHaveBeenCalledWith("manual-json");
  });

  it("lists shared backups and asks before loading one", async () => {
    const service = createService();
    const onImport = vi.fn();
    render(<AjustesPage onExport={() => ""} onImport={onImport} onReset={vi.fn()} sharedBackups={service} />);

    fireEvent.click(screen.getByRole("button", { name: "Cargar respaldo" }));

    await screen.findByRole("button", { name: /Cargar backup-a.json/ });
    expect(service.list).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Cargar backup-a.json/ }));

    expect(window.confirm).toHaveBeenCalledWith("Esto reemplazara el progreso actual con backup-a.json. Deseas continuar?");
    await waitFor(() => expect(service.load).toHaveBeenCalledWith("backup-a.json"));
    await waitFor(() => expect(onImport).toHaveBeenCalledWith("{\"datasetVersion\":\"v1\",\"collection\":{}}"));
  });

  it("asks before resetting progress", () => {
    const onReset = vi.fn();
    render(<AjustesPage onExport={() => ""} onImport={vi.fn()} onReset={onReset} sharedBackups={createService()} />);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar progreso" }));

    expect(window.confirm).toHaveBeenCalledWith("Esto borrara el progreso de este navegador. Deseas continuar?");
    expect(onReset).toHaveBeenCalled();
  });
});
