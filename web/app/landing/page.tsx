'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useGitHubStats, formatNumberCompact } from '../../hooks/useGitHubStats';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'cli' | 'docker' | 'webhook'>('cli');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { stars, isLoading: isGhLoading, isUnavailable: isGhUnavailable, repoUrl } = useGitHubStats();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const cliSnippet = 'npx envg-upload --file .env --project my-express-api --api http://localhost:4000';
  const dockerSnippet = 'docker compose up --build';

  return (
    <div className="min-h-screen bg-[#121318] text-[#e3e1e9] selection:bg-[#10b981]/30 selection:text-[#4edea3]">
      {/* 1. Top Navigation Header (design.md Section 4.2 Item 1) */}
      <nav className="h-16 border-b border-[#3c4a42] bg-[#121318]/90 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#292a2f] border border-[#3c4a42] flex items-center justify-center text-[#4edea3] group-hover:border-[#4edea3]/50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </div>
            <span className="font-semibold text-base tracking-tight text-[#e3e1e9]">EnvGuard</span>
            <Badge variant="standard">CLI v1.4</Badge>
          </Link>

          <div className="hidden md:flex items-center gap-5 text-xs text-[#bbcabf] font-mono">
            <a href="#features" className="hover:text-[#e3e1e9] transition-colors">Features</a>
            <a href="#comparison" className="hover:text-[#e3e1e9] transition-colors">How It Works</a>
            <a href="#transparency" className="hover:text-[#e3e1e9] transition-colors">CLI & Specs</a>
            <a href="#self-hosting" className="hover:text-[#e3e1e9] transition-colors">Self-Hosting</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3c4a42] bg-[#1a1b21] text-xs font-mono text-[#bbcabf] hover:text-[#e3e1e9] transition-colors"
          >
            {isGhLoading ? (
              <>
                <span className="material-symbols-outlined text-[15px] text-[#ffb95f]">star</span>
                <span className="w-6 h-3 rounded bg-[#292a2f] animate-pulse inline-block" />
              </>
            ) : !isGhUnavailable && stars !== null ? (
              <>
                <span className="material-symbols-outlined text-[15px] text-[#ffb95f]">star</span>
                <span>{formatNumberCompact(stars)}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px] text-[#4cd7f6]">code</span>
                <span>GitHub</span>
              </>
            )}
          </a>

          {isAuthLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-lg bg-[#1e1f25] animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-[#1e1f25] animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <Link href="/projects">
                <Button variant="primary" size="sm" icon="terminal">
                  Workspace
                </Button>
              </Link>

              <div className="h-4 w-px bg-[#3c4a42] mx-0.5 hidden sm:block" />

              {/* User profile area & Logout */}
              <div className="flex items-center gap-2">
                <Link
                  href="/projects"
                  title={user.email}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-[#1e1f25] border border-[#3c4a42] hover:border-[#10b981]/50 text-xs font-mono text-[#e3e1e9] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[10px] font-bold flex items-center justify-center">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate hidden sm:inline">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  icon="logout"
                  onClick={() => logout(null)}
                  title="Sign out of EnvGuard"
                  className="text-[#86948a] hover:text-rose-400"
                >
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>

              <Link href="/register">
                <Button variant="primary" size="sm" icon="person_add">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 border-b border-[#3c4a42]/60 bg-tech-grid overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Release Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-xs font-mono text-[#4edea3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" aria-hidden="true" />
            <span>Open Source Project Variable Governance</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#e3e1e9] max-w-4xl mx-auto leading-tight text-balance">
            Keep team variables in sync. <br className="hidden sm:inline" />
            <span className="text-[#4edea3] font-semibold">
              Track what changed, and know who changed it.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[#bbcabf] max-w-2xl mx-auto font-sans leading-relaxed text-pretty">
            EnvGuard tracks additions, updates, and removals without storing plaintext secrets.
            Synchronize instantly, keep <code className="text-xs font-mono text-[#4edea3] bg-[#1a1b21] px-1.5 py-0.5 rounded border border-[#3c4a42]">.env.example</code> templates accurate, and eliminate broken setups.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/projects">
              <Button variant="primary" size="lg" icon={isAuthenticated ? 'arrow_forward' : 'rocket_launch'}>
                {isAuthenticated ? 'Go to Workspace' : 'Open Dashboard'}
              </Button>
            </Link>
            <a href={repoUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="lg" icon="deployed_code">
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Quick CLI Snippet Box */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="rounded-xl border border-[#3c4a42] bg-[#0d0e13] p-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate text-[#4cd7f6] pl-2">
                <span className="text-[#86948a] select-none" aria-hidden="true">$</span>
                <span className="truncate">{cliSnippet}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={copiedSnippet === 'hero-cli' ? 'check' : 'content_copy'}
                onClick={() => copyToClipboard(cliSnippet, 'hero-cli')}
                aria-label="Copy CLI upload command"
                className="shrink-0"
              >
                {copiedSnippet === 'hero-cli' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Hero Visual: Developer Terminal & Diff Inspector */}
          <div className="mt-12 rounded-xl border border-[#3c4a42] bg-[#0d0e13] shadow-2xl shadow-black/80 text-left overflow-hidden">
            {/* Header bar */}
            <div className="h-10 bg-[#1a1b21] border-b border-[#3c4a42] px-4 flex items-center justify-between font-mono text-xs text-[#86948a]">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" aria-hidden="true" />
                <span className="text-[#bbcabf] font-medium truncate">
                  my-express-api / production (git:main)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="added">AUTO-MASK ENGINE</Badge>
                <span className="text-[11px] hidden sm:inline">sync: 2s ago</span>
              </div>
            </div>

            {/* Split pane body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#3c4a42] font-mono text-xs">
              {/* Left Pane (Incoming Changes & Diff Stream) */}
              <div className="lg:col-span-8 p-5 space-y-4">
                <div className="flex items-center justify-between text-[11px] text-[#86948a]">
                  <span>Incoming Environment Changes</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="added">+1 ADDED</Badge>
                    <span>alice@corp (via CLI push)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-[#10b981]/40 bg-[#10b981]/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#4edea3] font-bold">+</span>
                      <span className="font-semibold text-[#e3e1e9]">STRIPE_WEBHOOK_SECRET</span>
                      <Badge variant="critical">CRITICAL SECRET</Badge>
                    </div>
                    <span className="text-[#4cd7f6] bg-[#0d0e13] px-2 py-0.5 rounded border border-[#3c4a42]">
                      whsec_••••79a2
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#3c4a42]/50 bg-[#121318] flex items-center justify-between text-[#86948a]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#86948a]">=</span>
                      <span>MONGODB_URI</span>
                      <span className="text-[10px] text-[#86948a]">INFRA</span>
                    </div>
                    <span className="text-[11px]">mongodb://••••5012</span>
                  </div>

                  <div className="p-3 rounded-lg border border-[#3c4a42]/50 bg-[#121318] flex items-center justify-between text-[#86948a]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#86948a]">=</span>
                      <span>JWT_ACCESS_SECRET</span>
                      <span className="text-[10px] text-[#86948a]">AUTH</span>
                    </div>
                    <span className="text-[11px]">e4f8••••891c</span>
                  </div>
                </div>

                {/* Simulated live console log */}
                <div className="p-3 rounded-lg bg-[#121318] border border-[#3c4a42]/60 text-[11px] space-y-1 text-[#86948a]">
                  <p className="text-[#4edea3]">✔ Variable diff computed against database state</p>
                  <p className="text-[#4cd7f6]">ℹ Regenerated .env.example with updated blank stubs</p>
                  <p className="text-[#ffb95f]">⚡ Dispatched webhook alert: #eng-alerts (Slack)</p>
                </div>
              </div>

              {/* Right Pane (.env.example live preview) */}
              <div className="lg:col-span-4 p-5 space-y-3 bg-[#121318]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#86948a]">.env.example Preview</span>
                  <Badge variant="added">AUTO-SYNCED</Badge>
                </div>

                <pre className="p-3 rounded-lg bg-[#0d0e13] border border-[#3c4a42] text-[11px] text-[#bbcabf] overflow-x-auto leading-relaxed">
{`# Sanitized Team Stubs
CORS_ORIGIN=
DATABASE_URL=
JWT_ACCESS_SECRET=
PORT=
REDIS_CACHE_URL=
STRIPE_WEBHOOK_SECRET=`}
                </pre>

                <div className="flex items-center justify-between text-[10px] text-[#86948a] pt-1">
                  <span>Clean for Git commit</span>
                  <span className="text-[#4edea3]">● Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 20-Minute Debug Scenario Comparison Grid */}
      <section id="comparison" className="py-20 px-6 max-w-6xl mx-auto space-y-12 scroll-mt-16">
        <div className="space-y-3 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#e3e1e9] text-balance">
            Never lose time to uncommunicated variable changes
          </h2>
          <p className="text-sm text-[#bbcabf] font-sans leading-relaxed text-pretty">
            When a team member adds or renames an environment variable locally without notification, teammates encounter broken builds.
            EnvGuard keeps configurations synchronized and audit-logged across the team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unmonitored Drift */}
          <div className="rounded-xl border border-rose-500/30 bg-[#1a1b21] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/60">
              <span className="font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Without EnvGuard
              </span>
              <span className="material-symbols-outlined text-rose-400 text-[20px]" aria-hidden="true">cancel</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-[#bbcabf]">
                1. A teammate adds a required variable locally, but omits updating the team or template.
              </p>
              <p className="text-[#bbcabf]">
                2. Teammates pull the latest commit and hit runtime exceptions on startup:
              </p>
              <div className="p-3 rounded-lg bg-[#0d0e13] border border-rose-500/40 text-rose-400 text-[11px] leading-relaxed">
                TypeError: Cannot read properties of undefined (reading &apos;startsWith&apos;) at /server/src/billing.js:14:38
              </div>
              <p className="text-[#86948a] pt-1">
                Result: Lost engineering time debugging missing keys across environments.
              </p>
            </div>
          </div>

          {/* With EnvGuard */}
          <div className="rounded-xl border border-[#10b981]/50 bg-[#1a1b21] p-6 space-y-4 shadow-lg shadow-[#10b981]/5">
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/60">
              <span className="font-mono text-xs font-semibold text-[#4edea3] uppercase tracking-wider">
                With EnvGuard
              </span>
              <span className="material-symbols-outlined text-[#10b981] text-[20px]" aria-hidden="true">verified</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-[#bbcabf]">
                1. Developer synchronizes their local configuration via CLI in one step.
              </p>
              <p className="text-[#bbcabf]">
                2. Values are masked instantly, blank stubs update in .env.example, and team receives notifications:
              </p>
              <div className="p-3 rounded-lg bg-[#0d0e13] border border-[#10b981]/40 text-[#4edea3] text-[11px] leading-relaxed">
                ✔ [EnvGuard] STRIPE_WEBHOOK_SECRET synchronized (masked). .env.example updated.
              </div>
              <p className="text-[#86948a] pt-1">
                Result: Zero broken setups. Full visibility into who added or modified each key.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-10 scroll-mt-16">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#e3e1e9] text-balance">
            Designed for team configuration safety
          </h2>
          <p className="text-sm text-[#bbcabf] font-sans">
            Built strictly for auditability and drift prevention, without storing plaintext secrets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Masking Detail */}
          <div className="md:col-span-2 rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1e1f25] border border-[#3c4a42] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">enhanced_encryption</span>
                </div>
                <h3 className="text-base font-semibold text-[#e3e1e9]">Zero-Plaintext In-Memory Masking</h3>
              </div>
              <span className="font-mono text-[11px] text-[#4edea3] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                Formula Enforced
              </span>
            </div>
            <p className="text-xs text-[#bbcabf] font-sans leading-relaxed">
              Secrets are masked immediately upon arrival. Values with 8 characters or fewer become <code className="font-mono text-[#e3e1e9]">****</code>, and values longer than 8 characters retain only the first 4 and last 4 characters. A short SHA-256 fingerprint detects subsequent changes.
            </p>
            <div className="p-3 rounded-lg bg-[#0d0e13] border border-[#3c4a42] font-mono text-[11px] text-[#86948a] flex items-center justify-between">
              <span>RAW: whsec_9b2d8f1e4a7c0012</span>
              <span className="text-[#4edea3]">STORED: whsec_••••0012</span>
            </div>
          </div>

          {/* Automatic Templates */}
          <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e1f25] border border-[#3c4a42] flex items-center justify-center text-[#4cd7f6]">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">file_copy</span>
            </div>
            <h3 className="text-base font-semibold text-[#e3e1e9]">Automated .env.example Stubs</h3>
            <p className="text-xs text-[#bbcabf] font-sans leading-relaxed">
              Every sync keeps blank placeholder templates aligned. Teammates download clean files ready for git tracking with zero secret leakage.
            </p>
          </div>

          {/* Change Notifications */}
          <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e1f25] border border-[#3c4a42] flex items-center justify-center text-[#ffb95f]">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">notifications_active</span>
            </div>
            <h3 className="text-base font-semibold text-[#e3e1e9]">Critical Drift Webhooks</h3>
            <p className="text-xs text-[#bbcabf] font-sans leading-relaxed">
              Automated alerts trigger when sensitive patterns (<code className="font-mono text-[#ffb95f]">STRIPE_</code>, <code className="font-mono text-[#ffb95f]">JWT_</code>, <code className="font-mono text-[#ffb95f]">DB_</code>) change, routing to Slack channels or SMTP digests.
            </p>
          </div>

          {/* Non-Destructive Sync */}
          <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e1f25] border border-[#3c4a42] flex items-center justify-center text-[#4edea3]">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">sync</span>
            </div>
            <h3 className="text-base font-semibold text-[#e3e1e9]">Non-Destructive Sync</h3>
            <p className="text-xs text-[#bbcabf] font-sans leading-relaxed">
              Syncing new keys preserves existing variables without overwriting sibling services or deleting unmentioned definitions.
            </p>
          </div>

          {/* Detailed Activity History */}
          <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e1f25] border border-[#3c4a42] flex items-center justify-center text-[#4cd7f6]">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">history</span>
            </div>
            <h3 className="text-base font-semibold text-[#e3e1e9]">Immutable Audit Trail</h3>
            <p className="text-xs text-[#bbcabf] font-sans leading-relaxed">
              Every action records the actor, user role, timestamp, action type (added, modified, deleted), and diff representation.
            </p>
          </div>

          {/* Sovereign Infrastructure */}
          <div id="self-hosting" className="md:col-span-3 rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 flex flex-wrap items-center justify-between gap-4 scroll-mt-20">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-base font-semibold text-[#e3e1e9]">Self-Hosted & Private</h3>
              <p className="text-xs text-[#bbcabf] font-sans">
                Run natively via Node.js and MongoDB or spin up the full stack in one command with Docker Compose. No external telemetry or telemetry pings.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="standard">Docker Ready</Badge>
              <Badge variant="standard">MIT License</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technical Transparency */}
      <section id="transparency" className="py-20 px-6 max-w-5xl mx-auto space-y-8 scroll-mt-16">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-[#e3e1e9] text-balance">
            Integrate in seconds. Inspect every payload.
          </h2>
          <p className="text-xs text-[#bbcabf] font-mono">
            Direct CLI integration, compose definitions, and JSON webhook payloads.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#3c4a42] font-mono text-xs">
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-5 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === 'cli'
                ? 'border-[#10b981] text-[#4edea3]'
                : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
            }`}
          >
            CLI Command
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`px-5 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === 'docker'
                ? 'border-[#10b981] text-[#4edea3]'
                : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
            }`}
          >
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-5 py-2.5 border-b-2 font-medium transition-colors ${
              activeTab === 'webhook'
                ? 'border-[#10b981] text-[#4edea3]'
                : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
            }`}
          >
            Webhook JSON Payload
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="rounded-xl border border-[#3c4a42] bg-[#0d0e13] p-5 font-mono text-xs relative overflow-x-auto shadow-xl">
          {activeTab === 'cli' && (
            <pre className="text-[#bbcabf] leading-relaxed">
{`$ npx envg-upload --file .env --project my-express-api --api http://localhost:4000

[EnvGuard] Ingesting variables from .env…
[EnvGuard] Parsed 6 keys. Masking in memory before transmission…
[EnvGuard] Transmitting to http://localhost:4000 for project my-express-api…

✔ Synchronization successful!
  + 1 added
  ~ 0 updated
  - 0 deleted
  = 5 unchanged

Change Summary:
  + STRIPE_WEBHOOK_SECRET (whsec_••••79a2) [CRITICAL]`}
            </pre>
          )}

          {activeTab === 'docker' && (
            <pre className="text-[#4cd7f6] leading-relaxed">
{`services:
  mongodb:
    image: mongo:8.0
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

  backend:
    build: ./api
    ports: ["4000:4000"]
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/envguard
      - PORT=4000

  frontend:
    build: ./web
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000/api`}
            </pre>
          )}

          {activeTab === 'webhook' && (
            <pre className="text-[#ffb95f] leading-relaxed">
{`{
  "event": "critical_variable_change",
  "project": "my-express-api",
  "key": "STRIPE_WEBHOOK_SECRET",
  "action": "created",
  "changedBy": "alice@corp.com",
  "changedAt": "2026-09-30T15:42:00.000Z",
  "note": "Raw secret is never transmitted. Masked fingerprint only."
}`}
            </pre>
          )}
        </div>
      </section>

      {/* 6. Technical Specifications & Verified Stack */}
      <section className="py-10 border-y border-[#3c4a42]/50 bg-[#1a1b21]/40 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <Badge variant="standard">Node.js 20+ LTS</Badge>
          <Badge variant="standard">Next.js 16 App Router</Badge>
          <Badge variant="standard">TypeScript 5.8 Strict</Badge>
          <Badge variant="standard">MongoDB 8.0</Badge>
          <Badge variant="standard">Express 5 ESM</Badge>
          <Badge variant="standard">Tailwind CSS v4</Badge>
          <Badge variant="standard">MIT License</Badge>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#e3e1e9] text-balance">
          Never let missing environment variables break your team&apos;s build again.
        </h2>

        <div className="max-w-md mx-auto">
          <div className="rounded-xl border border-[#3c4a42] bg-[#0d0e13] p-2.5 flex items-center justify-between text-xs font-mono">
            <code className="text-[#4edea3] truncate pl-2">$ {dockerSnippet}</code>
            <Button
              variant="secondary"
              size="sm"
              icon={copiedSnippet === 'cta-docker' ? 'check' : 'content_copy'}
              onClick={() => copyToClipboard(dockerSnippet, 'cta-docker')}
              aria-label="Copy Docker compose command"
            >
              {copiedSnippet === 'cta-docker' ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/projects">
            <Button variant="primary" size="lg" icon="arrow_forward">
              {isAuthenticated ? 'Go to Workspace' : 'Open Dashboard'}
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link href="/register">
              <Button variant="secondary" size="lg" icon="person_add">
                Create Free Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* 8. Developer Footer (design.md Section 4.2 Item 8) */}
      <footer className="border-t border-[#3c4a42] bg-[#0d0e13] py-12 px-6 text-xs font-mono text-[#86948a]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#e3e1e9] font-semibold">EnvGuard — MERN Variable Governance</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-[#e3e1e9]">GitHub Repository</a>
            <a href="#transparency" className="hover:text-[#e3e1e9]">CLI Specification</a>
            <a href="#transparency" className="hover:text-[#e3e1e9]">Docker Architecture</a>
            <span>MIT License</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-[#3c4a42]/30 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <span>© 2026 EnvGuard Core Contributors. Open Source Developer Infrastructure.</span>
          <span>Zero-Plaintext Masking • SHA-256 Fingerprinting • Audit History</span>
        </div>
      </footer>
    </div>
  );
}
