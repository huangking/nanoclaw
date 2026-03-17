#!/usr/bin/env node
/**
 * Register a Discord channel with NanoClaw
 * Usage: node register-discord-channel.js <channel_id> <channel_name>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

// Parse arguments
const channelId = process.argv[2];
const channelName = process.argv[3] || 'discord-channel';

if (!channelId) {
  console.error('Usage: node register-discord-channel.js <channel_id> [channel_name]');
  console.error('');
  console.error('Examples:');
  console.error('  node register-discord-channel.js 1234567890123456789');
  console.error('  node register-discord-channel.js 1234567890123456789 "my-discord-channel"');
  console.error('');
  console.error('To get your Discord Channel ID:');
  console.error('  1. In Discord, enable Developer Mode (User Settings → Advanced → Developer Mode)');
  console.error('  2. Right-click on the channel → Copy Channel ID');
  process.exit(1);
}

// Create IPC directory for main group
const ipcDir = path.join(DATA_DIR, 'ipc', 'main', 'tasks');
fs.mkdirSync(ipcDir, { recursive: true });

// Create registration task
const task = {
  type: 'register_group',
  jid: `dc:${channelId}`,
  name: channelName,
  folder: channelName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),
  trigger: `@${channelName}`,
  requiresTrigger: true,
};

const taskFile = path.join(ipcDir, `register-${Date.now()}.json`);
fs.writeFileSync(taskFile, JSON.stringify(task, null, 2));

console.log(`Registration request created: ${taskFile}`);
console.log(`  Channel JID: dc:${channelId}`);
console.log(`  Name: ${channelName}`);
console.log(`  Folder: ${task.folder}`);
console.log(`  Trigger: ${task.trigger}`);
console.log('');
console.log('NanoClaw will process this request within a few seconds.');
console.log('Check the logs to confirm registration.');
