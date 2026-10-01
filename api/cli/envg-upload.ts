#!/usr/bin/env node
import { parseEnvFile } from './parser.js';
import { resolveToken, syncVariablesAPI } from './api-client.js';

interface CliArgs {
  file: string;
  project: string;
  api: string;
  token?: string;
  help: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    file: '.env',
    project: '',
    api: 'http://localhost:4000',
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--file' || arg === '-f') {
      result.file = args[++i] || '.env';
    } else if (arg === '--project' || arg === '-p') {
      result.project = args[++i] || '';
    } else if (arg === '--api' || arg === '-a') {
      result.api = args[++i] || 'http://localhost:4000';
    } else if (arg === '--token' || arg === '-t') {
      result.token = args[++i];
    }
  }

  return result;
}

function printHelp() {
  console.log(`
\x1b[32mEnvGuard CLI: envg-upload\x1b[0m
Synchronize local .env variables with EnvGuard server (Zero Plaintext Secrets)

Usage:
  npx envg-upload [options]

Options:
  -f, --file <path>       Path to local .env file (default: ".env")
  -p, --project <id/name> Project ID or Name (required)
  -a, --api <url>         EnvGuard API server URL (default: "http://localhost:4000")
  -t, --token <jwt>       Authentication token (or set ENVGUARD_TOKEN)
  -h, --help              Show this help message

Example:
  npx envg-upload --file .env --project 652a9f1e8bc2 --api http://localhost:4000
`);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.project) {
    console.error('\x1b[31mError: Missing required option --project\x1b[0m');
    printHelp();
    process.exit(1);
  }

  console.log(`\x1b[36m[EnvGuard]\x1b[0m Ingesting variables from \x1b[1m${args.file}\x1b[0m...`);

  try {
    const variables = parseEnvFile(args.file);
    console.log(`\x1b[36m[EnvGuard]\x1b[0m Parsed \x1b[32m${variables.length}\x1b[0m keys. Masking in memory before transmission...`);

    const token = resolveToken(args.token);
    console.log(`\x1b[36m[EnvGuard]\x1b[0m Transmitting to ${args.api} for project ${args.project}...`);

    const result = (await syncVariablesAPI(
      args.api,
      args.project,
      variables,
      token
    )) as {
      added: number;
      updated: number;
      deleted: number;
      unchanged: number;
      changes: Array<{
        key: string;
        action: string;
        newValueMasked?: string;
        oldValueMasked?: string;
        isCritical: boolean;
      }>;
    };

    console.log('\n\x1b[32m✔ Synchronization successful!\x1b[0m');
    console.log(`  \x1b[32m+ ${result.added} added\x1b[0m`);
    console.log(`  \x1b[33m~ ${result.updated} updated\x1b[0m`);
    console.log(`  \x1b[31m- ${result.deleted} deleted\x1b[0m`);
    console.log(`  \x1b[90m= ${result.unchanged} unchanged\x1b[0m\n`);

    if (result.changes.length > 0) {
      console.log('\x1b[1mChange Summary:\x1b[0m');
      for (const ch of result.changes) {
        const flag = ch.isCritical ? ' \x1b[33m[CRITICAL]\x1b[0m' : '';
        if (ch.action === 'created') {
          console.log(`  \x1b[32m+ ${ch.key}\x1b[0m (${ch.newValueMasked || '****'})${flag}`);
        } else if (ch.action === 'updated') {
          console.log(`  \x1b[33m~ ${ch.key}\x1b[0m (${ch.oldValueMasked} -> ${ch.newValueMasked})${flag}`);
        } else if (ch.action === 'deleted') {
          console.log(`  \x1b[31m- ${ch.key}\x1b[0m${flag}`);
        }
      }
    }
  } catch (error) {
    console.error(`\n\x1b[31m❌ Sync failed:\x1b[0m ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

run();
