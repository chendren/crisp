# crisp — Before / After Examples

These are real-style inputs from non-native speakers and vibe describers. Each shows the raw, the crisp output (deterministic + LLM polish), and why it matters.

All examples obey the no-regex rule in their implementation suggestions.

---

## 1. Classic non-native + direct translation (Chinese/Portuguese style)

**Raw:**
i want that you make the page of login with email and password. when the user success login go to the home. also have the button of register. please make nice.

**crisp:**
## Intent
Build a login page with email + password authentication that redirects to home on success and provides a register entry point.

## Constraints
- Use TypeScript.
- Prefer functional utilities; short single-responsibility functions.
- No regex — use string methods or LLM-based parsing for any validation.
- Follow project UI stack (React + Tailwind + shadcn/ui unless otherwise specified).
- Validate only at system boundaries.

## Success Criteria
- User can enter valid email + password and be taken to the authenticated home view.
- Clear error states for bad credentials, network failure, and malformed input.
- Register button/link is visible and functional (or clearly leads to registration flow).
- No TODOs or stubs in the delivered code.

## Execution Guidance
- If auth touches >3 files or involves architecture decisions, enter plan mode first.
- Build the complete, working flow end-to-end.

**Why it matters:** Removed "i want that you", added explicit success, surfaced constraints the user cares about (no regex), turned "make nice" into concrete acceptance criteria. The agent now has almost zero ambiguity.

---

## 2. Pure vibe (user's own mode)

**Raw:**
make a nice dashboard for the customer obsession stuff. cards and a table and filters. when click row it shows detail modal with notes.

**crisp (vibe profile):**
## Intent
Build a production-grade Customer Obsession dashboard that surfaces key records with cards, a filterable table, and row-click detail modals containing notes.

## Constraints
- TypeScript everywhere.
- Short functions, functional style preferred.
- No regex.
- Use shadcn/ui + Tailwind + React.
- For anything spanning multiple files or involving data model choices, enter plan mode first.
- Treat this as a full spec: deliver complete working implementation, zero stubs.

## Success Criteria
- Dashboard loads in <1.5s with realistic data.
- Cards show the top 4-6 aggregate signals.
- Table supports search + at least 2 quick filters (status, owner, date range).
- Clicking a row opens a detail modal with the full record + existing notes + ability to add a new note.
- All actions are wired to real data operations (or clear mock boundaries if no backend yet).
- Fully responsive, keyboard accessible, no console errors.

## Execution Guidance
- Build the full thing. Use existing patterns from the codebase for data fetching and modal state.

**Why it matters:** "Nice" became measurable. Vibe expanded per the user's explicit global rule. Agent will not ask "what do you mean by nice?" — it will ship.

---

## 3. Short non-native feature request

**Raw:**
create for me the api that receive the list of vendors and return only the active ones with total contract value.

**crisp:**
## Intent
Create an API endpoint (or function) that accepts a list of vendors and returns only the active ones, each augmented with their total contract value.

## Constraints
- TypeScript.
- Functional style for the transformation logic.
- No regex.
- Input validation only at the boundary.
- Return shape must be explicit and stable.

## Success Criteria
- Given an array of vendor objects, the output contains only those where active === true (or equivalent business flag).
- Each returned item includes a `totalContractValue` number computed from related contracts.
- Zero side effects; pure or clearly bounded.
- Handles empty input and missing contract data gracefully without throwing.

## Execution Guidance
- If this touches data models or multiple modules, plan first.
- Deliver the complete implementation + a simple usage example or test.

**Why it matters:** "create for me the api that receive..." became a precise contract with success criteria. Much higher chance of correct first implementation.

---

## 4–8 (abbreviated high-signal patterns for the corpus)

4. "the function that do the calculation of the price with tax and discount" → crisp version adds explicit inputs/outputs, edge cases (negative, zero), no magic numbers, success = "returns correct number for the 6 canonical test cases".

5. "add a button in the header that when click open the modal of settings and save the choice in local" → full component + state + persistence + keyboard + a11y + constraints from user's stack.

6. Spanish/Indian English mix: "please do the thing of upload the file and show progress and if fail retry two times" → structured, with retry policy as constraint, progress as first-class success signal.

7. Mixed vibe + non-native on a complex feature (the kind that usually spawns 4-5 follow-ups) → one crisp block that lets the agent finish in a single high-quality pass.

8. Already pretty good prompt that still benefits from user's personal standards injection ("no regex", "plan mode", "short functions").

(Full 8+ versions live in the released repo with exact golden outputs the skill/hook produce.)

---

## Token & Turn Impact (illustrative)

Typical raw non-native/vibe prompt on a medium feature: 80-140 tokens, 3-6 clarification or correction turns.

Same prompt after crisp: 220-380 tokens (one-time cost), 1-2 turns to done.

Net win is large, especially across a full project.

---

## How to add more examples

Run real messy prompts through `/crisp` (or the hook), capture the output, paste here with a short "why this rewrite was valuable" paragraph. Prefer examples from actual non-native colleagues or public non-native coding chats.
