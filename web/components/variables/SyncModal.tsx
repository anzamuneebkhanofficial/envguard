'use client';

import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import type { SyncDiffResponse, VariableItem } from '../../lib/variables';

interface SyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectId: string;
  existingVariables?: VariableItem[];
  onSyncPaste: (variables: Array<{ key: string; value: string }>) => Promise<SyncDiffResponse>;
}

export function SyncModal({
  open,
  onOpenChange,
  projectName,
  projectId,
  existingVariables = [],
  onSyncPaste,
}: SyncModalProps) {
  const [tab, setTab] = useState<'paste' | 'cli'>('paste');
  const [envText, setEnvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diffResult, setDiffResult] = useState<SyncDiffResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  const cliCommand = `npx envg-upload --file .env --project ${projectId || projectName} --api http://localhost:4000`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handlePasteSync = async () => {
    if (!envText.trim()) return;

    setIsSubmitting(true);
    setDiffResult(null);
    setErrorMessage(null);

    try {
      const lines = envText.split('\n');
      const vars: Array<{ key: string; value: string }> = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const equalIdx = trimmed.indexOf('=');
        if (equalIdx > 0) {
          const key = trimmed.slice(0, equalIdx).trim();
          let value = trimmed.slice(equalIdx + 1).trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          if (key) vars.push({ key, value });
        }
      }

      if (vars.length === 0) {
        setErrorMessage('Please enter at least one valid line in KEY=VALUE format.');
        return;
      }

      const res = await onSyncPaste(vars);
      setDiffResult(res);
      setEnvText('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update variables');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setDiffResult(null);
          setErrorMessage(null);
        }
      }}
      title="Sync Variables"
      description={`Add or update environment variables for ${projectName}. Values are masked in memory and secret values remain protected.`}
      className="max-w-xl"
    >
      {/* Existing Variables Overview Banner */}
      <div className="mb-4 p-3 rounded-lg border border-[#3c4a42] bg-[#0d0e13] text-xs">
        <div className="flex items-center justify-between text-[#e3e1e9] mb-1.5 font-medium">
          <span>Current Stored Variables ({existingVariables.length})</span>
          <span className="text-[11px] text-[#4edea3] font-mono">Safe Merge Active</span>
        </div>
        <p className="text-[11px] text-[#bbcabf] mb-2 leading-relaxed">
          Existing variables are never deleted when syncing. New keys will be added, matching keys will be updated, and your other existing keys stay completely safe.
        </p>
        {existingVariables.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pt-1 border-t border-[#3c4a42]/40 font-mono text-[10px]">
            {existingVariables.map((v) => (
              <span key={v.id || v.key} className="px-2 py-0.5 rounded bg-[#1e1f25] border border-[#3c4a42] text-[#4cd7f6]">
                {v.key}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-[#86948a] italic">
            No variables stored yet in this project.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3c4a42] mb-4 text-xs font-mono">
        <button
          onClick={() => {
            setTab('paste');
            setDiffResult(null);
            setErrorMessage(null);
          }}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            tab === 'paste'
              ? 'border-[#10b981] text-[#4edea3]'
              : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
          }`}
        >
          Add or Paste Variables
        </button>
        <button
          onClick={() => {
            setTab('cli');
            setDiffResult(null);
            setErrorMessage(null);
          }}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            tab === 'cli'
              ? 'border-[#10b981] text-[#4edea3]'
              : 'border-transparent text-[#86948a] hover:text-[#e3e1e9]'
          }`}
        >
          Terminal Upload Command
        </button>
      </div>

      {tab === 'paste' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#bbcabf] mb-1.5">
              PASTE OR TYPE VARIABLES (KEY=VALUE)
            </label>
            <textarea
              rows={7}
              value={envText}
              onChange={(e) => setEnvText(e.target.value)}
              placeholder="DATABASE_URL=mongodb://localhost:27017/mydb&#10;API_PORT=4000&#10;STRIPE_KEY=sk_test_..."
              className="w-full font-mono text-xs rounded-lg border border-[#3c4a42] bg-[#0d0e13] p-3 text-[#e3e1e9] placeholder-[#86948a] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs font-mono text-rose-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {diffResult && (
            <div className="p-3 rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 text-xs font-mono space-y-1">
              <div className="text-[#4edea3] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Sync Complete!</span>
              </div>
              <div className="text-[#bbcabf] text-[11px] grid grid-cols-3 gap-2 pt-1">
                <span>+ {diffResult.added} added</span>
                <span>~ {diffResult.updated} updated</span>
                <span>= {diffResult.unchanged} unchanged</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="primary"
              loading={isSubmitting}
              icon="sync"
              onClick={handlePasteSync}
              disabled={!envText.trim()}
            >
              Save & Sync Variables
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs font-mono">
          <p className="text-[#bbcabf] font-sans">
            To upload directly from your computer terminal in your project directory:
          </p>

          <div className="relative rounded-lg bg-[#0d0e13] border border-[#3c4a42] p-3 text-[#e3e1e9] flex items-center justify-between gap-2 overflow-x-auto">
            <code>$ {cliCommand}</code>
            <Button
              variant="secondary"
              size="sm"
              icon={copiedCli ? 'check' : 'content_copy'}
              onClick={handleCopyCli}
              className="shrink-0"
            >
              {copiedCli ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className="rounded-lg bg-[#121318] border border-[#3c4a42]/60 p-3 space-y-1 text-[11px] text-[#86948a] font-sans">
            <div className="flex items-center gap-1.5 text-[#4edea3]">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span className="font-semibold">Privacy Protection:</span>
            </div>
            <p>
              Your secret values are masked on your computer before saving. Unset variables in your project are never deleted.
            </p>
          </div>
        </div>
      )}
    </Dialog>
  );
}
