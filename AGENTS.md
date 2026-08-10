## architecture

`docs/ARCHITECTURE.md` is the authoritative architecture guide for this project.

Before proposing, reviewing, or implementing changes that affect project structure, feature boundaries, React patterns, state management, data flow, services, or external integrations, agents must read `docs/ARCHITECTURE.md` and follow its rules.

## UI Design and Shadcn

**Before generating any new component, utility function, hook, or service, the agent MUST:**

1. **Check whether an equivalent component already exists in the adopted UI library (Shadcn/ui).**
2. **Check whether an equivalent component has already been installed/generated locally** (e.g., via `npx shadcn add ...`) before writing a new component from scratch.
3. If the component exists in Shadcn but has not yet been installed in the project, **prioritize installing/generating it via the Shadcn CLI** instead of manually recreating it (buttons, inputs, modals, tables, dropdowns, toasts, dialogs, etc.).
4. Only create a custom component from scratch when:
   - There is no equivalent component in Shadcn/Radix; **or**
   - The component requires SICAPE-specific business/domain logic (e.g., webcam capture), in which case the "dumb"/presentational layer should still rely on Shadcn primitives whenever possible.

5. Never duplicate an existing component by creating a variation inside a `/features` folder. If a variation is necessary, it must **compose** the base Shadcn component rather than reimplementing it.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
