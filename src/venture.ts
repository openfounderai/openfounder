/**
 * Venture metadata — tracks seeded ventures on disk.
 * Stored at ~/.openfounder/ventures/<id>/
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { VentureMetadata } from "./types.js";

const VENTURES_DIR = path.join(os.homedir(), ".openfounder", "ventures");

export function getVenturesDir(): string {
  return VENTURES_DIR;
}

export function getVentureDir(ventureId: string): string {
  return path.join(VENTURES_DIR, ventureId);
}

/**
 * Save venture metadata and the original brief to disk.
 */
export function saveVenture(ventureId: string, brief: string, workflowId: string): VentureMetadata {
  const dir = getVentureDir(ventureId);
  fs.mkdirSync(dir, { recursive: true });

  const meta: VentureMetadata = {
    ventureId,
    brief,
    workflowId,
    createdAt: new Date().toISOString(),
    status: "seeding",
  };

  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(dir, "brief.md"), `# Business Brief\n\n${brief}\n`);

  return meta;
}

/**
 * Update venture status.
 */
export function updateVentureStatus(ventureId: string, status: VentureMetadata["status"]): void {
  const metaPath = path.join(getVentureDir(ventureId), "metadata.json");
  const meta: VentureMetadata = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  meta.status = status;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

/**
 * List all ventures.
 */
export function listVentures(): VentureMetadata[] {
  if (!fs.existsSync(VENTURES_DIR)) return [];

  return fs
    .readdirSync(VENTURES_DIR)
    .filter((name) => {
      const metaPath = path.join(VENTURES_DIR, name, "metadata.json");
      return fs.existsSync(metaPath);
    })
    .map((name) => {
      const metaPath = path.join(VENTURES_DIR, name, "metadata.json");
      return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as VentureMetadata;
    });
}
