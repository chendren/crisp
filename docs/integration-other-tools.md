# Using crisp quality in Kiro, Cursor, Cline, Continue, etc.

The plugin (hook + /crisp skill) is native to Grok Build and Claude Code.

For other interfaces you still get most of the value:

1. Copy `steering/CRISP.md` into your project's rules / system prompt area.
2. Use the deterministic rewriter directly:
   - `node -e 'import("./src/rewriter.mjs").then(m => console.log(m.enhance(process.argv[1])))' "your raw text"`
   - Or paste the raw into a one-off chat with a strong model + the CRISP steering block.
3. For the highest quality, paste your messy prompt into a Grok/Claude session that has the crisp plugin/skill, run `/crisp`, then copy the result into the other tool.

The core insight (normalize non-native + expand vibe into explicit intent + constraints + success before the main agent reasons) is universal.
