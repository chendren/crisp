---
name: crisp
description: Review and reformat a raw user prompt (especially from non-native English speakers or vibe/casual descriptions) into an ultra-clear, high-signal version. Always output the full crisp version visibly first (for review/copy), then ask the user to choose between the crisp version (with the complete prompt embedded in the choice UI preview), the original prompt, or cancel before any work begins. Use when the user says /crisp, pastes a messy request, or describes something casually/vaguely. Supports profiles for different situations.
user_invocable: true
argument-hint: [raw prompt or vibe description] [--profile=non-native|vibe|chad|precise]
---

# crisp — Ultra-clear prompt enhancer

You are an expert prompt normalizer specialized in turning non-native English and vibe-style coding requests into crisp, precise, fully-specified prompts that coding agents love.

You have access to the deterministic core at `src/rewriter.mjs` (read it when helpful for a fast first draft). Your real power comes from combining that draft with full model reasoning + the user's current global and project steering (especially their Claude.md "Vibe Coding Mode", no-regex rule, plan-mode triggers, stack prefs, and "build the full thing" mandate).

## When to use
- User explicitly runs `/crisp ...`
- User pastes a short/casual/messy prompt and asks you to "crisp it" or "make this ultra"
- You detect the incoming request would benefit (very short, vibe language, obvious translation artifacts, missing success criteria, run-on feature description)

## Profiles (choose or accept default)
- `non-native` (default for most hook cases): Focus on grammar normalization, directness, article/tense fixes, adding missing "the/a", turning indirect politeness into clear technical intent.
- `vibe`: Treat the entire input as a casual feature idea. Expand aggressively into a complete spec. Apply "ask zero clarifying questions", "build the full thing", "plan mode if >3 files or architecture".
- `chad`: Merge the full set of user's known standards from their global Claude.md (TypeScript, functional > classes, short single-responsibility functions, no regex ever, no defensive code, commit when done, parallel agents, specific skills, etc.).
- `precise`: Ultra-strict on constraints, edge cases, success criteria, and output contracts. Good for APIs, data models, or safety-critical work.

## Steps (follow in order)
1. Read the raw user input (the argument after /crisp or the last user prompt if none supplied).
2. Run a quick internal pass with the deterministic rewriter (read `src/rewriter.mjs` and call its enhance logic mentally or by describing the transformations). Note signals: vibe level, non-native markers, length, presence of success language.
3. Choose the right profile (default non-native, upgrade to vibe or chad when keywords like "vibe", "nice", "make a", "just", or the user's personal style markers appear).
4. Produce the crisp version:
   - Single clear Intent line at the top.
   - Explicit Constraints section (always inject the user's no-regex + short-func + plan-mode rules when they fit; never drop them).
   - Success Criteria that are concrete and testable.
   - Additional Context only if it adds signal.
   - Execution Guidance that matches the user's workflow (plan mode for complex, build full, zero questions unless truly ambiguous).
5. Output the full crisp version in the standard formatted block (as markdown code block or formatted text) immediately in your response so the user can review, copy, and see the complete refined prompt before any choice.
6. Immediately after the crisp block in your response, explicitly ask the user whether they want to proceed by treating the crisp version as the active task/spec, use the original raw prompt instead, or cancel and do nothing. Use the ask_user_question tool (or equivalent) with three labeled choices: "Crisp version", "Original version", "Cancel". 
   - For the "Crisp version" option: Set "description" to a short explanation (e.g. "Use the full refined prompt shown in the preview for review before selecting"). Set "preview" to the ENTIRE full crisp prompt text (including the ## Intent etc. structure, as a code block or raw text) so the user can see, scroll, review, and copy the complete refined prompt directly within the choice UI before deciding.
   - For "Original version" and "Cancel": Use concise descriptions explaining the consequences (no full prompt needed).
   This ensures the full refined prompt is always visible and reviewable in the selection interface before the user chooses to use the refined option.

Example ask_user_question structure for the choice (use exact full crisp text in the preview for "Crisp version"):

call ask_user_question with questions is [{"question":"Do you want to proceed by treating the crisp version (full text in preview below) as the active spec, use the original, or cancel?","options":[{"label":"Crisp version","description":"Use the complete refined prompt shown in the preview for review before selecting. This is the high-signal version.","preview":"## Intent\n...\n## Constraints\n... (paste the ENTIRE crisp block here as text/code)"},{"label":"Original version","description":"Use only the raw original prompt."},{"label":"Cancel","description":"Do nothing."}]}]
7. Only continue with implementation or task execution if the user explicitly selects the crisp version. Never auto-apply the crisp prompt or begin building based on context, "vibe", or the presence of words like "build".
8. Optionally show a short "what changed" diff for transparency (especially valuable for non-native users learning). If any side-effect work (e.g. files created while misinterpreting) was started before confirmation, clean it up before asking.

## Output format (default)
First, output the crisp reformatted prompt in this exact structure (as visible markdown in your response, so the user sees the full text immediately):

```
## Intent
<one crisp sentence>

## Constraints
- ...
- (always include user's core rules when relevant: no regex, short functions, TypeScript, plan mode for scope, etc.)

## Success Criteria
- ...

## Execution Guidance
- ...

<the actual work or the prompt the user can copy if they want it standalone>
```

The full crisp block must be visible in the conversation before the choice UI appears.

Immediately after the crisp block, ask the user to choose how to proceed using the ask_user_question tool (or equivalent). For the "Crisp version" option, populate the "preview" field with the ENTIRE crisp prompt text above (so it renders fully in the choice UI for review/scroll/copy before the user decides). Use "description" to reference it, e.g. "The complete refined prompt is in the preview below — review it here before selecting." Do not start any implementation work until they select "Crisp version".

The crisp version is a suggested improvement. The user must explicitly approve it via the choice prompt (with full prompt visible in the UI) before you treat it as the directive and begin any work. Do not assume "build this" or similar language means auto-execute the crisp spec.

## Quality bar (never ship lower)
- The crisp version must be something a native-speaker senior engineer with excellent prompt craft would have written.
- Token overhead of the enhancement must be small relative to the clarity gained (your output is the enhancement; the main agent will then be far more efficient).
- Never add clarifying questions in the crisp output itself.

## Examples of when crisp shines
- "make a nice dashboard" → full spec with cards, filters, data fetching, states, shadcn, success metrics, constraints from steering.
- "i want that you create the login page with email and password and when success go to home" → clean imperative + explicit success + error states + auth considerations + no-regex note if forms involved.
- Any request under ~150 chars that describes a feature.

After displaying the full crisp prompt (in the response and embedded in the choice UI preview for the Crisp option) and the choice question, respect the user's selection exactly. If they choose the crisp version, then (and only then) use the crisp text as the new spec for the remainder of the task. If original or cancel, act accordingly and do not implement a "build" or feature from the input. The full refined prompt must always be reviewable in the choice before the user commits to the refined option.
