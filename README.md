# OpenFounder

Open source platform that lets one person found and operate multiple startups with AI teams.

Built on [antfarm](https://github.com/snarktank/antfarm) — multi-agent workflow orchestration for [OpenClaw](https://docs.openclaw.ai).

<!-- Future CLI tagline: "From bash to startup" -->

## Vision

Write a startup idea. An autonomous AI team builds, launches, and operates it — while you sit in the stakeholder's seat. Run 5, 10, or 20 AI-operated startups simultaneously.

See [MANIFESTO.md](MANIFESTO.md) for the full vision.

## Status

Early development. The engine layer (antfarm) is production-ready. OpenFounder adds:

- **CEO agent** — takes a business brief, designs the team, runs the operation
- **Business agents** — growth, content, research, design (beyond dev-focused workflows)
- **Governance** — stakeholder approval gates, spending control, strategic steering
- **Portfolio** — multi-venture dashboard, capital allocation, CEO reporting

## Architecture

```
openfounder/
  src/              ← OpenFounder platform layer
  workflows/        ← Custom workflows (seed-startup, growth-sprint, etc.)
  agents/           ← Business agents (CEO, growth, content, research)
  node_modules/
    antfarm/        ← Engine dependency (orchestration, steps, events, cron)
```

OpenFounder extends antfarm's primitives — workflows, agents, steps, events — without modifying the engine. Custom workflows and agents are defined in YAML and Markdown, the same way antfarm's bundled workflows work.

## Requirements

- Node.js >= 22
- [OpenClaw](https://docs.openclaw.ai) running on the host
- [antfarm](https://github.com/snarktank/antfarm) (installed as dependency)

## License

MIT
