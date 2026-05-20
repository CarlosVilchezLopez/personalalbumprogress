import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the dashboard as the first screen", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Panini Mundial 2026/i })).toBeInTheDocument();
    expect(screen.getByText("Avance")).toBeInTheDocument();
    expect(screen.getAllByText("Faltantes").length).toBeGreaterThan(0);
  });
});
