/**
 * Seed flow orchestrator — the main pipeline that takes a business brief
 * and produces a running AI team.
 *
 * Flow:
 *   1. Call CEO agent → get plan
 *   2. Validate plan
 *   3. Save venture metadata
 *   4. Write workflow files to antfarm
 *   5. Install workflow via antfarm CLI
 *   6. Start first run via antfarm CLI
 */

import { callCeo } from "./ceo/agent.js";
import { validatePlan } from "./validate.js";
import { saveVenture, updateVentureStatus } from "./venture.js";
import { writeWorkflow, installWorkflow, runWorkflow } from "./install.js";
import type { SeedResult } from "./types.js";

export async function seedVenture(brief: string): Promise<SeedResult> {
  // Step 1: CEO designs the team
  console.log("\n  Analyzing business brief...\n");
  const plan = await callCeo(brief);
  console.log(`  Venture: ${plan.ventureId}`);
  console.log(`  Workflow: ${plan.workflowName}`);
  console.log(`  Agents: ${plan.agents.map((a) => a.name).join(", ")}`);
  console.log(`  Steps: ${plan.steps.length}`);

  // Step 2: Validate
  console.log("\n  Validating plan...");
  validatePlan(plan);
  console.log("  Plan is valid.\n");

  // Step 3: Save venture metadata
  console.log("  Saving venture metadata...");
  saveVenture(plan.ventureId, brief, plan.ventureId);

  // Step 4: Write workflow files
  console.log("  Writing workflow files...");
  const workflowDir = writeWorkflow(plan);
  console.log(`  Workflow written to ${workflowDir}\n`);

  // Step 5: Install via antfarm
  console.log("  Installing workflow...\n");
  installWorkflow(plan.ventureId);

  // Step 6: Start first run
  console.log("\n  Starting first sprint...\n");
  const output = runWorkflow(plan.ventureId, plan.firstTask);

  // Update venture status
  updateVentureStatus(plan.ventureId, "running");

  // Parse run info from antfarm output
  const runIdMatch = output.match(/run[:\s]+([a-f0-9-]+)/i);
  const runNumberMatch = output.match(/#(\d+)/);

  const result: SeedResult = {
    ventureId: plan.ventureId,
    runId: runIdMatch?.[1] ?? "unknown",
    runNumber: runNumberMatch ? parseInt(runNumberMatch[1], 10) : 1,
    workflowId: plan.ventureId,
    task: plan.firstTask,
  };

  console.log(`  Venture "${plan.ventureId}" is live.`);
  console.log(`  Task: ${plan.firstTask}`);
  console.log(`\n  Your AI team is working. Check status with: antfarm workflow status\n`);

  return result;
}
