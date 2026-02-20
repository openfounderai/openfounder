/**
 * Validate a CeoPlan against antfarm's constraints before writing files.
 */

import type { AgentRole, CeoPlan } from "./types.js";

const VALID_ROLES: Set<string> = new Set<string>([
  "analysis",
  "coding",
  "verification",
  "testing",
  "pr",
  "scanning",
]);

export class ValidationError extends Error {
  constructor(public issues: string[]) {
    super(`Plan validation failed:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "ValidationError";
  }
}

export function validatePlan(plan: CeoPlan): void {
  const issues: string[] = [];

  // Venture ID
  if (!plan.ventureId) {
    issues.push("Missing ventureId");
  } else if (plan.ventureId.includes("_")) {
    issues.push(`ventureId "${plan.ventureId}" must not contain underscores`);
  } else if (!/^[a-z0-9-]+$/.test(plan.ventureId)) {
    issues.push(`ventureId "${plan.ventureId}" must be lowercase alphanumeric with hyphens only`);
  }

  // Agents
  if (!plan.agents?.length) {
    issues.push("No agents defined");
  }

  const agentIds = new Set<string>();
  for (const agent of plan.agents ?? []) {
    if (!agent.id) {
      issues.push("Agent missing id");
      continue;
    }
    if (agent.id.includes("_")) {
      issues.push(`Agent "${agent.id}" must not contain underscores`);
    }
    if (!/^[a-z0-9-]+$/.test(agent.id)) {
      issues.push(`Agent "${agent.id}" must be lowercase alphanumeric with hyphens only`);
    }
    if (agentIds.has(agent.id)) {
      issues.push(`Duplicate agent id "${agent.id}"`);
    }
    agentIds.add(agent.id);

    if (!agent.role || !VALID_ROLES.has(agent.role)) {
      issues.push(`Agent "${agent.id}" has invalid role "${agent.role}". Valid: ${[...VALID_ROLES].join(", ")}`);
    }

    // Check files
    if (!agent.files) {
      issues.push(`Agent "${agent.id}" missing files`);
    } else {
      for (const f of ["AGENTS.md", "IDENTITY.md", "SOUL.md"] as const) {
        if (!agent.files[f]?.trim()) {
          issues.push(`Agent "${agent.id}" missing or empty ${f}`);
        }
      }
    }
  }

  // Steps
  if (!plan.steps?.length) {
    issues.push("No steps defined");
  }

  const stepIds = new Set<string>();
  for (const step of plan.steps ?? []) {
    if (!step.id) {
      issues.push("Step missing id");
      continue;
    }
    if (stepIds.has(step.id)) {
      issues.push(`Duplicate step id "${step.id}"`);
    }
    stepIds.add(step.id);

    if (!step.agent) {
      issues.push(`Step "${step.id}" missing agent`);
    } else if (!agentIds.has(step.agent)) {
      issues.push(`Step "${step.id}" references unknown agent "${step.agent}"`);
    }

    if (!step.input?.trim()) {
      issues.push(`Step "${step.id}" missing input`);
    }

    if (!step.expects?.trim()) {
      issues.push(`Step "${step.id}" missing expects`);
    }

    // Loop validation
    if (step.type === "loop") {
      if (!step.loop) {
        issues.push(`Step "${step.id}" has type=loop but no loop config`);
      } else {
        if (step.loop.over !== "stories") {
          issues.push(`Step "${step.id}" loop.over must be "stories"`);
        }
        if (step.loop.completion !== "all_done") {
          issues.push(`Step "${step.id}" loop.completion must be "all_done"`);
        }
        if (step.loop.verify_each && step.loop.verify_step) {
          if (!stepIds.has(step.loop.verify_step) && !plan.steps.some((s) => s.id === step.loop!.verify_step)) {
            issues.push(`Step "${step.id}" loop.verify_step references unknown step "${step.loop.verify_step}"`);
          }
        }
      }
    }

    // on_fail validation
    if (step.on_fail?.retry_step) {
      if (!plan.steps.some((s) => s.id === step.on_fail!.retry_step)) {
        issues.push(`Step "${step.id}" on_fail.retry_step references unknown step "${step.on_fail.retry_step}"`);
      }
    }
  }

  // First step must contain {{task}}
  if (plan.steps?.length && plan.steps[0].input && !plan.steps[0].input.includes("{{task}}")) {
    issues.push('First step input must include {{task}} template variable');
  }

  // First task
  if (!plan.firstTask?.trim()) {
    issues.push("Missing firstTask");
  }

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }
}
