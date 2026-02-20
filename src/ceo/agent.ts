/**
 * CEO agent — takes a business brief, returns a structured plan
 * via a single Anthropic API call.
 */

import Anthropic from "@anthropic-ai/sdk";
import { CEO_MODEL } from "../models.js";
import { buildCeoPrompt } from "./prompt.js";
import type { CeoPlan } from "../types.js";

/**
 * Call the CEO agent with a business brief.
 * Returns a parsed CeoPlan ready for validation and installation.
 */
export async function callCeo(brief: string): Promise<CeoPlan> {
  const client = new Anthropic();

  const systemPrompt = buildCeoPrompt(brief);

  const response = await client.messages.create({
    model: CEO_MODEL,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: `Design an autonomous AI team for this startup idea:\n\n${brief}`,
      },
    ],
    system: systemPrompt,
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return parseCeoResponse(text);
}

/**
 * Extract and parse the JSON plan from the CEO's response.
 * Handles fenced code blocks (```json ... ```) or raw JSON.
 */
function parseCeoResponse(text: string): CeoPlan {
  // Try fenced JSON block first
  const fenced = text.match(/```json\s*\n([\s\S]*?)\n```/);
  const jsonStr = fenced ? fenced[1] : text.trim();

  let plan: CeoPlan;
  try {
    plan = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(
      `CEO response is not valid JSON: ${(e as Error).message}\n\nResponse:\n${text.slice(0, 500)}`
    );
  }

  // Basic shape check
  if (!plan.ventureId || !plan.agents?.length || !plan.steps?.length || !plan.firstTask) {
    throw new Error(
      "CEO response missing required fields (ventureId, agents, steps, firstTask)"
    );
  }

  return plan;
}
