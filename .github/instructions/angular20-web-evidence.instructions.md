---
applyTo: 'experiments/web-mcp/angular20/**/*.ts'
---

# Angular 20 evidence

- This experiment targets Angular 20.x.
- Treat `https://v20.angular.dev/` as the authoritative documentation source for Angular version-sensitive semantics in this path.
- When a review finding depends on Angular runtime, scheduling, lifecycle, or API semantics, verify the assumption against version-matched official documentation rather than newer/latest Angular behavior.
- If the version-specific behavior cannot be substantiated, do not present the assumption as a confirmed defect.
