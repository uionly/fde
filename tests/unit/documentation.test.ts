import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

describe("project documentation", () => {
  it("keeps the credential-free quick start safe", () => {
    const readme = read("README.md");
    const environmentExample = read(".env.example");

    expect(readme).toContain("npm ci");
    expect(readme).toContain("npm run dev");
    expect(readme).not.toContain("cp .env.example .env.local");
    expect(environmentExample).not.toMatch(/^DATABASE_URL=/m);
    expect(environmentExample).not.toMatch(/^AUTH_SECRET=/m);
    expect(environmentExample).toMatch(/^ENABLE_DEV_AUTH=false$/m);
    expect(environmentExample).toMatch(/^AI_MODE=mock$/m);
  });

  it("references real files and no longer carries the bootstrap-only prompt", () => {
    const readme = read("README.md");
    const relativeLinks = [...readme.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+)\)/g)].map((match) => match[1].split("#")[0]);

    for (const target of relativeLinks) {
      expect(fs.existsSync(path.resolve(repositoryRoot, decodeURIComponent(target))), `Missing README target: ${target}`).toBe(true);
    }
    expect(fs.existsSync(path.join(repositoryRoot, "docs", "CODEX_START_PROMPT.md"))).toBe(false);
  });

  it("documents only npm scripts exposed by the package", () => {
    const readme = read("README.md");
    const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    const documentedScripts = new Set([...readme.matchAll(/npm run ([a-z0-9:-]+)/g)].map((match) => match[1]));

    for (const script of documentedScripts) expect(packageJson.scripts).toHaveProperty(script);
  });
});
