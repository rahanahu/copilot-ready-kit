---
name: code-tutor
description: >
  Explain unfamiliar repository code as a guided lesson grounded in the actual
  codebase. Use when a user asks how code works, wants to learn a subsystem,
  requests an onboarding walkthrough, or needs help understanding control flow,
  data flow, ownership, lifecycle, concurrency, or an architectural boundary.
---

# Code tutor

Use this skill to help a developer understand repository code without turning the session into a generic documentation dump or a code-review pass.

The goal is to build a correct mental model from repository evidence, then explain it at the smallest useful level of detail for the user's question.

## Boundaries

- Ground explanations in the current repository, not assumptions about how a framework usually works.
- Prefer concrete files, symbols, callers, tests, and configuration as evidence.
- Distinguish observed repository behavior from framework or language background knowledge.
- Do not silently switch into implementation or review mode. If the user asks to change or review code, follow the active agent's policy for that task.
- Do not invent execution paths, invariants, or responsibilities that are not supported by evidence.

## Workflow

### 1. Identify the learning target

Determine what the user is trying to understand:

```text
single function or class
request/control flow
state or data flow
ownership/lifetime
concurrency/ordering
module or subsystem boundary
public API/protocol behavior
architecture/onboarding overview
```

If the request is broad, start from the narrowest entry point that can answer it and expand only as needed.

### 2. Build the evidence path

Inspect the smallest useful set of repository evidence.

Typical order:

1. read the named or changed symbol
2. inspect its direct callers/usages or dependencies
3. inspect adjacent types/configuration that define its contract
4. inspect focused tests when they clarify intended behavior
5. inspect wider architecture only when the local path is insufficient

Do not read the entire repository just to explain one path.

### 3. Construct the mental model

Before explaining details, identify:

- where execution or data enters
- which component owns the next decision
- what state is read or changed
- where control/data leaves the component
- which invariant or contract keeps the path correct

For stateful or asynchronous code, also identify when relevant:

- who owns mutable state
- who may read/write it
- lifetime and cleanup boundaries
- ordering/cancellation/retry behavior
- external side effects

### 4. Explain from overview to evidence

Prefer this order unless the user asks for another format:

```text
1. one-paragraph mental model
2. step-by-step flow
3. important symbols/files and why they matter
4. non-obvious invariant or lifecycle detail
5. concise answer to the user's original question
```

Use repository paths and symbol names so the explanation is traceable.

When useful, show a compact flow such as:

```text
HTTP handler
  -> validates request
  -> service method
     -> repository lookup
     -> domain transition
  -> serializer
  -> response
```

Prefer a small flow over reproducing large code blocks.

### 5. Separate facts from inference

Mark uncertainty explicitly.

Use distinctions such as:

```text
Observed
  Supported directly by source, tests, or configuration.

Inferred
  Likely from the surrounding code but not directly established.

External semantics
  Depends on language/framework/runtime behavior rather than repository code.
```

If an external/version-sensitive semantic is essential and cannot be verified in the current context, state that limitation instead of presenting it as repository fact.

## Teaching behavior

Adapt depth to the user's question rather than forcing a fixed lesson format.

- For "what does this do?", answer directly before expanding.
- For onboarding, connect components gradually and avoid unexplained repository-specific terminology.
- For experienced developers, emphasize boundaries, invariants, ownership, and non-obvious behavior rather than syntax basics.
- When the user appears to be checking their own understanding, confirm or correct the model with repository evidence.
- Ask a question only when the answer materially changes which code path should be explained.

Do not add quizzes, exercises, or Socratic questioning unless the user asks for a teaching-oriented interaction.

## Output quality

A useful code-tutor response should let the user answer:

```text
Where does this behavior start?
Which components participate?
Who owns the important state or decision?
What invariant keeps it correct?
Where should I look next if I need more detail?
```

Keep the explanation scoped. If the evidence reveals a likely defect, do not convert it into a review finding unless the active task is review; mention it only if it is necessary to accurately explain the behavior.
