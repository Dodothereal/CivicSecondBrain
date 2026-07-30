/**
 * dashboard-data.test.ts
 *
 * Tests for getDashboardData's Recent Activity parsing. Legacy LINT log
 * entries were written as "LINT | full" — the feed rendered the bare word
 * "full" as the entry description, which read as broken output/an error to
 * users. Legacy labels must be humanized; sentence-style labels pass through.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

let tmpDir: string;

async function importDashboardData() {
  vi.resetModules();
  return import("@/lib/wiki/dashboard-data");
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dashboard-data-test-"));
  process.env.WIKI_PATH = tmpDir;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.WIKI_PATH;
});

describe("getDashboardData — recent activity labels", () => {
  it('humanizes the legacy "LINT | full" label instead of showing the bare flag', async () => {
    fs.writeFileSync(
      path.join(tmpDir, "log.md"),
      [
        "## [2026-07-20] LINT | full",
        "**Pages analyzed:** 82",
        "",
        "## [2026-07-21] INGEST | FY2026 Budget",
        "**Source:** https://example.gov/budget.pdf",
      ].join("\n"),
      "utf-8"
    );
    const { getDashboardData } = await importDashboardData();
    const { recentLog } = await getDashboardData();

    const lint = recentLog.find((e) => e.operation === "LINT");
    expect(lint).toBeDefined();
    expect(lint!.label).toBe("Full wiki analysis");

    // Non-legacy labels pass through untouched
    const ingest = recentLog.find((e) => e.operation === "INGEST");
    expect(ingest!.label).toBe("FY2026 Budget");
  });

  it("passes new sentence-style LINT labels through verbatim", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "log.md"),
      "## [2026-07-22] LINT | Analyzed 82 pages — 5 recommendations generated\n**Pages analyzed:** 82\n",
      "utf-8"
    );
    const { getDashboardData } = await importDashboardData();
    const { recentLog } = await getDashboardData();

    expect(recentLog[0].label).toBe("Analyzed 82 pages — 5 recommendations generated");
  });
});
