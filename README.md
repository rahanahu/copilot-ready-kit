# templatecopilotagent

A small, opinionated template for GitHub Copilot custom agents in VS Code.

The template separates repository-wide facts from agent orchestration:

```text
User
 ├─ Orchestrator
 │   ├─ Scout
 │   └─ Reviewer
 │
 └─ DeepReviewer   # explicitly started by a human before merge/release
     └─ Scout
```

## Roles

- **Orchestrator** — primary agent for planning, implementation, and integration. It delegates broad research instead of filling its own context with raw research output.
- **Scout** — low-cost, read-only research worker for web and repository investigation. It returns compact evidence, including `file:path` for repository findings.
- **Reviewer** — routine, read-only reviewer invoked by the Orchestrator after meaningful changes.
- **DeepReviewer** — human-invoked pre-merge reviewer for broader architectural, regression, compatibility, security, and test review. It can delegate research to Scout.

## Files

```text
.github/
├── copilot-instructions.md
└── agents/
    ├── orchestrator.agent.md
    ├── scout.agent.md
    ├── reviewer.agent.md
    └── deep-reviewer.agent.md
```

## Customize for a repository

1. Replace the placeholders in `.github/copilot-instructions.md` with authoritative repository facts such as language/runtime versions, target platforms, build/test commands, and dependency/framework versions.
2. Adjust agent models to match the models available in your Copilot plan. Scout intentionally defaults to Claude Haiku 4.5 as a cost-conscious research model.
3. Adjust the tool lists if the repository needs additional MCP or extension tools.
4. Keep routing/orchestration policy in the agent files rather than growing `copilot-instructions.md` with agent-specific behavior.

## Design intent

The main context should contain decisions and compact evidence, not large amounts of raw web pages or broad exploratory repository output. Scout is the isolation boundary for that research. Reviewer is optimized for frequent feedback; DeepReviewer is intentionally separate so a human can request a more exhaustive gate before merge.
