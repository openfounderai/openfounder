/**
 * Model registry — maps agent roles to recommended models.
 *
 * The CEO agent references this when assigning models to workflow agents.
 * Update this file as new models ship or pricing changes.
 */

import type { AgentRole } from "./types.js";

export interface ModelSpec {
  id: string;
  strengths: string;
}

/**
 * Recommended model for each agent role.
 * CEO uses this to assign the right model per agent position.
 */
export const MODEL_FOR_ROLE: Record<AgentRole, ModelSpec> = {
  analysis: {
    id: "claude-sonnet-4-6",
    strengths: "Strong reasoning, planning, and structured output. Good for architecture decisions, code review, and strategic analysis.",
  },
  coding: {
    id: "claude-sonnet-4-6",
    strengths: "Fast, accurate code generation. Handles large codebases, multi-file edits, and test writing.",
  },
  verification: {
    id: "claude-sonnet-4-6",
    strengths: "Thorough verification and bug detection. Good at reading test output and identifying failures.",
  },
  testing: {
    id: "claude-sonnet-4-6",
    strengths: "Test generation and QA. Understands testing frameworks and edge cases.",
  },
  pr: {
    id: "claude-sonnet-4-6",
    strengths: "Clean PR descriptions, commit messages, and changelog generation.",
  },
  scanning: {
    id: "claude-sonnet-4-6",
    strengths: "Web research, security scanning, competitive analysis. Good with web_search and web_fetch tools.",
  },
};

/** Cheap model for polling (Phase 1 of two-phase cron). */
export const POLLING_MODEL = "default";

/** Model used for the CEO agent itself (seed-time reasoning). */
export const CEO_MODEL = "claude-sonnet-4-6";
