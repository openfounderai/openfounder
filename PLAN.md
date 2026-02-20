# OpenFounder — Development Plan

## Phase 1: CEO Agent + Seed Flow ✅

Implemented. `openfounder seed "idea"` → CEO agent → antfarm workflow → running AI team.

---

## Phase 2: Business-Layer Agents

**Goal**: Extend beyond dev-focused workflows. The CEO agent should be able to assemble teams with business agents, not just planner/developer/tester.

**New agent roles to define** (as antfarm-compatible workflow agents):
- **Growth** — SEO, paid acquisition, conversion optimization. Role: `scanning` (needs web_search, web_fetch).
- **Content** — Blog posts, social copy, email sequences. Role: `coding` (needs write access).
- **Research** — Market analysis, competitor tracking, user interview analysis. Role: `scanning` (needs web).
- **Designer** — UI/UX, landing pages, visual assets. Role: `coding` (needs write + browser for preview).
- **Product** — Specs, user stories, backlog prioritization. Role: `analysis`.

**New workflow templates** the CEO should be able to generate:
- `launch-mvp` — plan → build → test → deploy → launch copy → PR
- `growth-sprint` — research → growth-plan → implement → measure
- `content-sprint` — research → content-plan → write → review → publish
- `market-research` — research → analyze → report

**Work**:
- Update CEO prompt with new agent role definitions and workflow templates
- Add model mappings for new roles
- Test with non-SaaS business ideas (content agency, marketplace, API product)

---

## Phase 3: Governance Layer

**Goal**: Human-in-the-loop controls. The stakeholder retains authority over money and strategy.

**Approval gates** — extend antfarm's step system:
- Add `approval_required: true` to step definitions
- When a step hits an approval gate, it pauses and notifies the stakeholder
- Stakeholder approves/rejects via CLI: `openfounder approve <run-id> <step-id>`
- Low-risk actions auto-approve, high-risk (spend, deploy, external comms) require human

**CEO reporting**:
- After each sprint/run completes, CEO generates a structured report
- Report: what shipped, metrics, blockers, recommendations, budget requests
- Stored in `~/.openfounder/ventures/<id>/reports/`

**Spending tracking**:
- Budget per venture (configured at seed time or via `openfounder budget <id> <amount>`)
- Expense requests from agents come through approval gates
- Track actual spend (API costs, tool costs) per venture

**Work**:
- `src/governance/approval.ts` — approval gate logic
- `src/governance/reports.ts` — CEO report generation
- `src/governance/budget.ts` — spending tracking
- CLI commands: `openfounder approve`, `openfounder report <id>`, `openfounder budget`
- May require contributing upstream to antfarm (adding step pause/approval state)

---

## Phase 4: Portfolio Dashboard

**Goal**: Multi-venture management from a single view.

**Dashboard** — web UI (extends antfarm's existing dashboard):
- Portfolio view: all ventures, their status, key metrics
- Per-venture detail: run history, agent output, CEO reports
- Capital allocation: budget distribution across ventures
- Weekly call schedule: which CEO to sync with

**Venture lifecycle**:
- `openfounder seed` — create new venture
- `openfounder ventures` — list all ventures
- `openfounder pause <id>` — pause a venture's operations
- `openfounder kill <id>` — shut down a venture
- `openfounder status <id>` — detailed venture status

**Work**:
- `src/portfolio/dashboard.ts` — HTTP server extending antfarm's dashboard
- `src/portfolio/ventures.ts` — venture CRUD operations
- `src/portfolio/metrics.ts` — cross-venture metrics aggregation
- CLI commands: `openfounder ventures`, `openfounder pause`, `openfounder kill`

---

## Phase 5: Hosted Platform

**Goal**: openfounder.io becomes the commercial hosted product.

- Multi-tenant architecture (PostgreSQL replaces SQLite)
- One-click deployment from seed prompt (web UI)
- Managed infrastructure: code hosting, domains, email, analytics
- Stakeholder mobile app for approvals and CEO syncs
- Billing: per-venture pricing ($50-200/mo)
- Authentication, team management, API keys

**This phase lives in the `openfounderai/openfounder.io` repo** (private), not the open-source core.

---

## Architecture Reference

```
openfounderai/openfounder/          ← open source core
  src/
    cli.ts                          ← CLI entry point
    seed.ts                         ← seed flow orchestrator
    types.ts                        ← shared types
    models.ts                       ← model registry
    validate.ts                     ← plan validation
    install.ts                      ← antfarm integration
    venture.ts                      ← venture metadata
    ceo/
      agent.ts                      ← CEO agent (Claude API)
      prompt.ts                     ← CEO system prompt
    governance/                     ← Phase 3
    portfolio/                      ← Phase 4
  MANIFESTO.md
  README.md
  package.json                      ← antfarm as git dep
  node_modules/antfarm/             ← orchestration engine (built at install time)
```

## Dependencies

- **antfarm** (github:snarktank/antfarm) — workflow orchestration engine
- **OpenClaw** — agent runtime (system prerequisite, not npm dep)
- **@anthropic-ai/sdk** — Claude API for CEO agent
- **yaml** — YAML generation for workflow files

## Key Antfarm Conventions

- Workflow IDs: no underscores (used as namespace separator)
- Agent IDs: no underscores (namespaced as `<workflowId>_<agentId>`)
- Context propagation: agents output `KEY: VALUE` → becomes `{{key}}` in later steps
- `STORIES_JSON`: special output that creates story records for loop steps
- Agent files: AGENTS.md (operational brief), IDENTITY.md (name+role), SOUL.md (personality)
- Roles: analysis, coding, verification, testing, pr, scanning (each has different tool access)
- Two-phase cron: cheap polling model checks for work, expensive model runs when work exists
