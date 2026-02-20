#!/usr/bin/env node

/**
 * OpenFounder CLI
 *
 * From bash to startup.
 *
 * Usage:
 *   openfounder seed "Your business idea here"
 */

import { seedVenture } from "./seed.js";

const VERSION = "0.1.0";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    process.exit(0);
  }

  if (command === "seed") {
    const brief = args.slice(1).join(" ");
    if (!brief.trim()) {
      console.error("Error: Please provide a business brief.\n");
      console.error('  openfounder seed "A SaaS tool that monitors competitor pricing"');
      process.exit(1);
    }

    try {
      await seedVenture(brief);
    } catch (err) {
      console.error(`\n  Error: ${(err as Error).message}\n`);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  printUsage();
  process.exit(1);
}

function printUsage() {
  console.log(`
  openfounder v${VERSION} — From bash to startup.

  Usage:
    openfounder seed "<business idea>"    Seed a new venture with an AI team

  Options:
    --help, -h       Show this help
    --version, -v    Show version
`);
}

main();
