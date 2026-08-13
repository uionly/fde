import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const globals = fs.readFileSync(path.join(repositoryRoot, "app/globals.css"), "utf8");
const layout = fs.readFileSync(path.join(repositoryRoot, "app/layout.tsx"), "utf8");

const palettes = {
  stone: ["#f8f8fa", "#f2f2f5", "#e6e6ea", "#d0d0d7", "#a8a8b2", "#7c7c88", "#595964", "#404049", "#212127", "#1a1a1e"],
  indigo: ["#fde5f1", "#fbb9da", "#f88ac0", "#f45aa6", "#f03391", "#ec0b7c", "#cc0a6b", "#a30857", "#6a0539", "#490427"],
  teal: ["#e2f7fd", "#b3ecfa", "#81dff5", "#4fd2f0", "#2ac8ec", "#05bee7", "#04a1c4", "#037e99", "#025263", "#013945"],
  emerald: ["#eff8f4", "#d9eee4", "#aedcc7", "#82c8a8", "#4cb182", "#1f9d63", "#1b8a57", "#167147", "#125b39", "#0e472d"],
  rose: ["#feeff1", "#fcd9de", "#f8afba", "#f48293", "#ef4d65", "#eb203e", "#cf1c37", "#a9172d", "#881324", "#6a0e1c"],
  amber: ["#fef9f0", "#fdf0da", "#fbdfb0", "#f9cd84", "#f7b84f", "#f5a623", "#d8921f", "#b07819", "#8e6014", "#6e4b10"],
} as const;
const paletteSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return (linear[0] * 0.2126) + (linear[1] * 0.7152) + (linear[2] * 0.0722);
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("TO THE NEW brand tokens", () => {
  it("defines the complete supplied Tailwind palette", () => {
    for (const [palette, colors] of Object.entries(palettes)) {
      colors.forEach((color, index) => {
        expect(globals).toContain(`--color-${palette}-${paletteSteps[index]}: ${color};`);
      });
    }

    expect(globals).toContain("--radius-md: 8px;");
    expect(globals).toContain("--radius-lg: 12px;");
    expect(globals).toContain("--shadow-sm: 0 1px 3px rgba(26, 26, 30, 0.08), 0 1px 2px rgba(26, 26, 30, 0.06);");
  });

  it("uses Montserrat for product typography while retaining a code font", () => {
    expect(globals.startsWith('@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap");\n@import "tailwindcss";')).toBe(true);
    expect(globals).toContain('--font-sans: "Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif;');
    expect(globals).toContain('--font-serif: "Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif;');
    expect(globals).toContain("font-family: var(--font-sans);");
    expect(layout).not.toContain("Geist(");
    expect(layout).toContain("Geist_Mono");
  });

  it("maps accessible brand colors into both semantic themes", () => {
    expect(globals).toContain("--primary: var(--color-indigo-600);");
    expect(globals).toContain("--accent: var(--color-teal-50);");
    expect(globals).toContain("--primary: var(--color-indigo-300);");
    expect(globals).toContain("--accent: var(--color-teal-900);");
    expect(globals).toContain("--inverse-primary: var(--color-indigo-300);");
    expect(globals).toContain("--inverse-primary: var(--color-indigo-700);");

    expect(contrast("#cc0a6b", "#f8f8fa")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#f45aa6", "#1a1a1e")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#025263", "#e2f7fd")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#b3ecfa", "#013945")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#f45aa6", "#212127")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#a30857", "#f2f2f5")).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves the global focus and reduced-motion safeguards", () => {
    expect(globals).toContain(":focus-visible");
    expect(globals).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globals).toContain("scroll-behavior: auto;");
  });
});
