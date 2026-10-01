#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { resolveToken, fetchEnvExampleAPI } from './api-client.js';

interface CliArgs {
  project: string;
  api: string;
  output: string;
  token?: string;
  help: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    project: '',
    api: 'http://localhost:4000',
    output: '.env.example',
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--project' || arg === '-p') {
      result.project = args[++i] || '';
    } else if (arg === '--api' || arg === '-a') {
      result.api = args[++i] || 'http://localhost:4000';
    } else if (arg === '--output' || arg === '-o') {
      result.output = args[++i] || '.env.example';
    } else if (arg === '--token' || arg === '-t') {
      result.token = args[++i];
    }
  }

  return result;
}

function printHelp() {
  console.log(`
\x1b[32mEnvGuard CLI: sync-example\x1b[0m
Retrieve the auto-generated blank .env.example template from EnvGuard

Usage:
  npx envguard-sync-example [options]

Options:
  -p, --project <id>      Project ID (required)
  -a, --api <url>         EnvGuard API server URL (default: "http://localhost:4000")
  -o, --output <path>     Destination output file (default: ".env.example")
  -t, --token <jwt>       Authentication token (or set ENVGUARD_TOKEN)
  -h, --help              Show this help message

Example:
  npx envguard-sync-example --project 652a9f1e8bc2 --output .env.example
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

  console.log(`\x1b[36m[EnvGuard]\x1b[0m Fetching latest blank template for project ${args.project}...`);

  try {
    const token = resolveToken(args.token);
    const content = await fetchEnvExampleAPI(args.api, args.project, token);

    const outputPath = path.resolve(process.cwd(), args.output);
    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`\x1b[32m✔ Successfully generated ${args.output}\x1b[0m`);
    console.log(`  File size: ${Buffer.byteLength(content, 'utf-8')} bytes`);
    console.log('  Clean for git commit: Contains blank stubs with zero plaintext values.');
  } catch (error) {
    console.error(`\n\x1b[31m❌ Sync example failed:\x1b[0m ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

run();
