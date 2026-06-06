#!/usr/bin/env node
// Tiny standalone entry for `npx crisp enhance "raw prompt"` (future expansion).
import { enhance } from '../src/rewriter.mjs';

const args = process.argv.slice(2);
if (args[0] === 'enhance' || args[0] === 'e') {
  const input = args.slice(1).join(' ');
  if (!input) {
    console.error('Usage: crisp enhance "your raw prompt here"');
    process.exit(1);
  }
  console.log(enhance(input));
} else {
  console.log('crisp — ultra-clear prompt enhancer. Use /crisp inside Grok/Claude or "crisp enhance ..." here.');
}
