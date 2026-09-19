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
