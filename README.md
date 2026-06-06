# crisp

**Ultra-clear prompts for non-native English speakers and vibe coders.**

One lightweight, always-on hook + one powerful `/crisp` skill + one drop-in steering file.

- **Frugal**: deterministic core does 80-90% of the work with zero model tokens and <150ms latency.
- **Fast**: hook never blocks the UI meaningfully.
- **Extremely accurate & valuable**: bakes in the exact prompt craft that makes Grok Build, Claude Code, Kiro, and similar agents ship complete, correct work on the first serious pass — even when the human input is casual, translated, or underspecified.

No regex in the implementation (string methods + simple scanners only). Respects and amplifies your existing `CLAUDE.md` / `AGENTS.md` / "vibe coding" rules.

## Install (Grok Build / Claude Code)

```bash
# From GitHub (once published)
grok plugin install <your-username>/crisp --trust

# Or during development
grok plugin install /absolute/path/to/crisp --trust
```

Then trust the plugin in the hooks/plugins modal (`/plugins` or `Ctrl+L`).

The `UserPromptSubmit` hook activates immediately for auto-enhancement.

## Usage

### Automatic (hook)
Just type normally. When crisp detects vibe language, short requests, or non-native patterns, it injects a systemMessage with the enhanced version at the very start of the turn. The agent sees the crisp intent first.

You will see the enhancement in the scrollback (annotated as crisp).

Toggle with config if you want it silent or off.

### On-demand (best quality)
```
/crisp make a nice dashboard with filters and row detail for the customer data
/crisp --profile=vibe the login flow should feel premium
/crisp i want that you create the api that return only active vendors with total value
```

The skill produces a full structured prompt (and can continue straight into implementation if the context is "build this").

### Drop-in steering (works everywhere)
Copy `steering/CRISP.md` into any project's `CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, or equivalent. Gives passive improvement even without the plugin.

## Why this exists

Non-native speakers and fast "vibe" thinkers lose huge amounts of leverage with agentic coding tools. The raw prompt has low signal. The model spends early turns doing disambiguation that a better prompt would have made unnecessary.

crisp normalizes at the exact right moment (submit) or on explicit request, using both fast local logic and the full power of your preferred model + your personal steering.

Result: fewer turns, higher quality first outputs, and the non-native user sees the "correct English shape" of a great prompt — learning happens as a side effect.

## Configuration

See `crisp.config.example.json`. Place a `crisp.config.json` in your project or user plugin data dir.

Key toggles:
- `autoEnhance` — control the UserPromptSubmit hook
- `defaultProfile`
- `includePersonalStandards` — pull extra rules from your global Claude.md when enhancing

## Development & Verification

After any change:

1. `node src/rewriter.mjs` (or import it) on sample strings — must produce clean output, zero regex in the module.
2. Test the hook script with a small JSON stdin blob containing `user_prompt`.
3. Install locally: `grok plugin install . --trust`
4. Submit real messy prompts. Check latency in the hooks modal and that the agent acts on the enhanced version.
5. `/crisp` on a non-trivial vibe request → agent ships complete correct work with no follow-up questions.
6. Grep the entire tree for actual regex usage in code (comments explaining "no regex" are fine).
7. Drop `steering/CRISP.md` into a temp project and observe improved baseline behavior.

See `examples/before-after.md` for the living corpus.

## Philosophy (matches high-signal users)

- Treat "vibe", "make it nice", short descriptions as full specs.
- Build the complete thing. No stubs.
- Plan mode for anything >3 files or architectural.
- Short functions. Functional utilities. No regex. Validate at boundaries.
- The enhancement itself must be high-signal and low-token-overhead.

## License

MIT

## Status

Early (0.1). Core deterministic rewriter + hook + skill + steering are the priority. Feedback on real non-native prompts is gold.
