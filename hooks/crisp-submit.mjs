#!/usr/bin/env node
/**
 * crisp UserPromptSubmit hook (Node .mjs, zero regex)
 * Fast deterministic enhancement + systemMessage injection.
 * Follows hook contract from hookify + computer + security-guidance examples.
 */

import { readFileSync } from 'node:fs';
import { enhance } from '../src/rewriter.mjs';

function readStdin() {
  // Node in hook context: read full stdin
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  const raw = readStdin();
  if (!raw) {
    process.stdout.write('{}');
    process.exit(0);
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.stdout.write('{}');
    process.exit(0);
  }

  // Per hookify rule_engine and security example, user_prompt is the key for prompt events
  const userPrompt = input.user_prompt || input.prompt || (input.tool_input && input.tool_input.prompt) || '';
  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length < 3) {
    process.stdout.write('{}');
    process.exit(0);
  }

  // Fast path: deterministic only (no model call, no keys, sub-100ms target)
  const enhanced = enhance(userPrompt, { source: 'hook' });

  // Only inject when there was meaningful work (vibe or non-native signals or very short)
  const lower = userPrompt.toLowerCase();
  const didWork = enhanced.length > userPrompt.length * 1.15 ||
                  lower.includes('make a') || lower.includes('i want') || lower.includes('please') ||
                  userPrompt.length < 140;

  if (!didWork) {
    process.stdout.write('{}');
    process.exit(0);
  }

  const systemMessage = [
    '**crisp (auto-enhanced prompt)**',
    '',
    enhanced,
    '',
    '---',
    `Raw user input (for reference only): ${userPrompt}`,
    '',
    'Respond to the enhanced version above as the primary intent. The raw is provided only for fidelity.',
  ].join('\n');

  const output = {
    systemMessage,
    // Optional hookSpecificOutput for future richer UIs
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      crispEnhanced: true,
    },
  };

  process.stdout.write(JSON.stringify(output));
  process.exit(0);
}

main();
