export type AgentRole = "analysis" | "coding" | "verification" | "testing" | "pr" | "scanning";

export interface CeoAgentDef {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  model?: string;
  pollingModel?: string;
  files: {
    "AGENTS.md": string;
    "IDENTITY.md": string;
    "SOUL.md": string;
  };
}

export interface CeoStepDef {
  id: string;
  agent: string;
  type?: "single" | "loop";
  loop?: {
    over: "stories";
    completion: "all_done";
    fresh_session?: boolean;
    verify_each?: boolean;
    verify_step?: string;
  };
  input: string;
  expects: string;
  max_retries?: number;
  on_fail?: {
    retry_step?: string;
    max_retries?: number;
    escalate_to?: string;
    on_exhausted?: {
      escalate_to: string;
    };
  };
}

export interface CeoPlan {
  ventureId: string;
  workflowName: string;
  description: string;
  agents: CeoAgentDef[];
  steps: CeoStepDef[];
  context?: Record<string, string>;
  firstTask: string;
}

export interface SeedResult {
  ventureId: string;
  runId: string;
  runNumber: number;
  workflowId: string;
  task: string;
}

export interface VentureMetadata {
  ventureId: string;
  brief: string;
  workflowId: string;
  createdAt: string;
  status: "seeding" | "running" | "paused" | "stopped";
}
