/**
 * Tests for the agent-runner IPC message handling and output formatting
 */

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const IPC_INPUT_DIR = '/tmp/nanoclaw-test-ipc/input';
const IPC_INPUT_CLOSE_SENTINEL = path.join(IPC_INPUT_DIR, '_close');

describe('agent-runner IPC handling', () => {
  beforeEach(() => {
    // Clean up and create test directories
    try { fs.rmSync(IPC_INPUT_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
    fs.mkdirSync(IPC_INPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directories
    try { fs.rmSync(IPC_INPUT_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  describe('drainIpcInput', () => {
    it('returns empty array when no messages exist', () => {
      const messages = drainIpcInput();
      expect(messages).toEqual([]);
    });

    it('returns messages from JSON files', () => {
      // Write test message files
      const file1 = path.join(IPC_INPUT_DIR, '001-test.json');
      const file2 = path.join(IPC_INPUT_DIR, '002-test.json');

      fs.writeFileSync(file1, JSON.stringify({ type: 'message', text: 'Hello' }));
      fs.writeFileSync(file2, JSON.stringify({ type: 'message', text: 'World' }));

      const messages = drainIpcInput();

      expect(messages).toEqual(['Hello', 'World']);
      // Files should be deleted after draining
      expect(fs.existsSync(file1)).toBe(false);
      expect(fs.existsSync(file2)).toBe(false);
    });

    it('ignores non-message types', () => {
      const file = path.join(IPC_INPUT_DIR, 'test.json');
      fs.writeFileSync(file, JSON.stringify({ type: 'schedule_task', prompt: 'test' }));

      const messages = drainIpcInput();

      expect(messages).toEqual([]);
      expect(fs.existsSync(file)).toBe(false);
    });

    it('ignores messages without text', () => {
      const file = path.join(IPC_INPUT_DIR, 'test.json');
      fs.writeFileSync(file, JSON.stringify({ type: 'message' }));

      const messages = drainIpcInput();

      expect(messages).toEqual([]);
      expect(fs.existsSync(file)).toBe(false);
    });

    it('handles malformed JSON gracefully', () => {
      const file = path.join(IPC_INPUT_DIR, 'test.json');
      fs.writeFileSync(file, 'not valid json');

      const messages = drainIpcInput();

      expect(messages).toEqual([]);
      expect(fs.existsSync(file)).toBe(false);
    });
  });

  describe('shouldClose', () => {
    it('returns false when sentinel does not exist', () => {
      const result = shouldClose();
      expect(result).toBe(false);
    });

    it('returns true and deletes sentinel when it exists', () => {
      fs.writeFileSync(IPC_INPUT_CLOSE_SENTINEL, '');

      const result = shouldClose();

      expect(result).toBe(true);
      expect(fs.existsSync(IPC_INPUT_CLOSE_SENTINEL)).toBe(false);
    });
  });

  describe('output markers', () => {
    it('writes output with correct markers', () => {
      const output = { status: 'success', result: 'test', newSessionId: '123' };
      const result = formatOutput(output);

      expect(result).toContain('---NANOCLAW_OUTPUT_START---');
      expect(result).toContain(JSON.stringify(output));
      expect(result).toContain('---NANOCLAW_OUTPUT_END---');
    });
  });
});

// Test helper functions (mirroring the agent-runner implementation)
function drainIpcInput(): string[] {
  try {
    fs.mkdirSync(IPC_INPUT_DIR, { recursive: true });
    const files = fs.readdirSync(IPC_INPUT_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();

    const messages: string[] = [];
    for (const file of files) {
      const filePath = path.join(IPC_INPUT_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        fs.unlinkSync(filePath);
        if (data.type === 'message' && data.text) {
          messages.push(data.text);
        }
      } catch {
        try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      }
    }
    return messages;
  } catch {
    return [];
  }
}

function shouldClose(): boolean {
  if (fs.existsSync(IPC_INPUT_CLOSE_SENTINEL)) {
    try { fs.unlinkSync(IPC_INPUT_CLOSE_SENTINEL); } catch { /* ignore */ }
    return true;
  }
  return false;
}

function formatOutput(output: { status: string; result: string | null; newSessionId?: string }): string {
  const OUTPUT_START_MARKER = '---NANOCLAW_OUTPUT_START---';
  const OUTPUT_END_MARKER = '---NANOCLAW_OUTPUT_END---';

  let result = OUTPUT_START_MARKER + '\n';
  result += JSON.stringify(output) + '\n';
  result += OUTPUT_END_MARKER;

  return result;
}
