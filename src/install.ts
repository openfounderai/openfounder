/**
 * Antfarm integration — writes workflow files and shells out to antfarm CLI
 * for installation and run creation.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import type { CeoPlan } from "./types.js";
import { POLLING_MODEL } from "./models.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the antfarm CLI entry point.
 * Looks for the built dist/cli/cli.js in node_modules/antfarm.
 */
function getAntfarmCliPath(): string {
  // From dist/ (compiled), go up to project root, then into node_modules
  const projectRoot = path.resolve(__dirname, "..");
  const cliPath = path.join(projectRoot, "node_modules", "antfarm", "dist", "cli", "cli.js");
  if (!fs.existsSync(cliPath)) {
    throw new Error(
      `Antfarm CLI not found at ${cliPath}. Run "npm install" to build antfarm.`
    );
  }
  return cliPath;
}

/**
 * Get the antfarm workflows directory where generated workflows go.
 */
function getWorkflowsDir(): string {
  const projectRoot = path.resolve(__dirname, "..");
  return path.join(projectRoot, "node_modules", "antfarm", "workflows");
}

/**
 * Write a CeoPlan as an antfarm workflow directory.
 * Creates workflow.yml + agent subdirectories with their markdown files.
 */
export function writeWorkflow(plan: CeoPlan): string {
  const workflowDir = path.join(getWorkflowsDir(), plan.ventureId);
  fs.mkdirSync(workflowDir, { recursive: true });

  // Build workflow.yml
  const workflow: Record<string, unknown> = {
    id: plan.ventureId,
    name: plan.workflowName,
    description: plan.description,
    polling: {
      model: POLLING_MODEL,
      timeoutSeconds: 120,
    },
    agents: plan.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      description: agent.description,
      ...(agent.model ? { model: agent.model } : {}),
      ...(agent.pollingModel ? { pollingModel: agent.pollingModel } : {}),
      workspace: {
        baseDir: `agents/${agent.id}`,
        files: {
          "AGENTS.md": `agents/${agent.id}/AGENTS.md`,
          "SOUL.md": `agents/${agent.id}/SOUL.md`,
          "IDENTITY.md": `agents/${agent.id}/IDENTITY.md`,
        },
      },
    })),
    steps: plan.steps.map((step) => {
      const s: Record<string, unknown> = {
        id: step.id,
        agent: step.agent,
        input: step.input,
        expects: step.expects,
      };
      if (step.type === "loop") {
        s.type = "loop";
        s.loop = {
          over: step.loop!.over,
          completion: step.loop!.completion,
          ...(step.loop!.fresh_session ? { fresh_session: step.loop!.fresh_session } : {}),
          ...(step.loop!.verify_each ? { verify_each: step.loop!.verify_each } : {}),
          ...(step.loop!.verify_step ? { verify_step: step.loop!.verify_step } : {}),
        };
      }
      if (step.max_retries !== undefined) s.max_retries = step.max_retries;
      if (step.on_fail) s.on_fail = step.on_fail;
      return s;
    }),
  };

  if (plan.context && Object.keys(plan.context).length > 0) {
    workflow.context = plan.context;
  }

  const yamlStr = YAML.stringify(workflow, { lineWidth: 0 });
  fs.writeFileSync(path.join(workflowDir, "workflow.yml"), yamlStr);

  // Write agent files
  for (const agent of plan.agents) {
    const agentDir = path.join(workflowDir, "agents", agent.id);
    fs.mkdirSync(agentDir, { recursive: true });
    fs.writeFileSync(path.join(agentDir, "AGENTS.md"), agent.files["AGENTS.md"]);
    fs.writeFileSync(path.join(agentDir, "IDENTITY.md"), agent.files["IDENTITY.md"]);
    fs.writeFileSync(path.join(agentDir, "SOUL.md"), agent.files["SOUL.md"]);
  }

  return workflowDir;
}

/**
 * Install the workflow via antfarm CLI.
 */
export function installWorkflow(ventureId: string): void {
  const cli = getAntfarmCliPath();
  execSync(`node "${cli}" workflow install ${ventureId}`, {
    stdio: "inherit",
    timeout: 60_000,
  });
}

/**
 * Start a workflow run via antfarm CLI.
 * Returns the run output (which includes run ID).
 */
export function runWorkflow(ventureId: string, task: string): string {
  const cli = getAntfarmCliPath();
  const output = execSync(`node "${cli}" workflow run ${ventureId} "${task.replace(/"/g, '\\"')}"`, {
    encoding: "utf-8",
    timeout: 30_000,
  });
  return output;
}
