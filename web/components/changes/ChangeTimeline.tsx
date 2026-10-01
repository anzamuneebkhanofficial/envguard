'use client';

import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { formatRelativeTime } from '../../utils/format';
import type { ChangeItem } from '../../lib/changes';

interface ChangeTimelineProps {
  changes: ChangeItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ChangeTimeline({ changes, isLoading = false, emptyMessage = 'No changes recorded yet' }: ChangeTimelineProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#3c4a42]/60">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <div className="absolute -left-6 top-2 w-2.5 h-2.5 rounded-full ring-4 ring-[#1a1b21] bg-[#1e1f25] animate-pulse" />
            <div className="rounded-xl border border-[#3c4a42]/50 bg-[#1a1b21] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-[#1e1f25] animate-pulse" />
                <div className="h-3 w-16 rounded bg-[#1e1f25] animate-pulse" />
              </div>
              <div className="h-3 w-44 rounded bg-[#1e1f25] animate-pulse" />
              <div className="h-8 w-full rounded bg-[#0d0e13] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="rounded-xl border border-[#3c4a42] bg-[#0d0e13] p-8 text-center text-xs text-[#86948a] font-mono">
        <span className="material-symbols-outlined text-[28px] text-[#86948a] mb-2">history</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#3c4a42]">
      {changes.map((change) => {
        const isAdded = change.action === 'created';
        const isModified = change.action === 'updated';
        const isDeleted = change.action === 'deleted';
        const isProjectDeleted = change.action === 'project_deleted';

        const nodeColor = isAdded
          ? 'bg-[#4edea3]'
          : isModified
          ? 'bg-[#4cd7f6]'
          : isDeleted || isProjectDeleted
          ? 'bg-[#ffb4ab]'
          : 'bg-[#86948a]';

        // Select the most transparent, legible value for authorized members
        const displayNew = change.newValue || change.newValueMasked;
        const displayOld = change.oldValue || change.oldValueMasked;

        return (
          <div key={change.id} className="relative group">
            {/* Timeline node */}
            <div
              className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#1a1b21] ${nodeColor}`}
            />

            {/* Event box */}
            <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-4 text-xs font-mono transition-colors group-hover:border-[#3c4a42]/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={isAdded ? 'added' : isModified ? 'modified' : isDeleted || isProjectDeleted ? 'deleted' : 'standard'}>
                    {isAdded
                      ? '+ ADDED'
                      : isModified
                      ? '~ UPDATED'
                      : isDeleted
                      ? '- REMOVED'
                      : isProjectDeleted
                      ? 'ARCHIVED'
                      : change.action.toUpperCase()}
                  </Badge>
                  <span className="font-semibold text-sm text-[#e3e1e9]">{change.key}</span>
                </div>

                <div className="flex items-center gap-2 text-[#86948a] text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span title={new Date(change.changedAt).toLocaleString()}>{formatRelativeTime(change.changedAt)}</span>
                  <span>•</span>
                  <span className="text-[#bbcabf]">{change.source === 'cli' ? 'Terminal' : 'Dashboard'}</span>
                </div>
              </div>

              {/* User details header: Name — Role — Action */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#bbcabf] font-sans pt-0.5">
                <span className="font-semibold text-[#e3e1e9]">{change.userName || change.changedBy.split('@')[0]}</span>
                <span className="text-[#86948a]">•</span>
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-medium ${
                    change.userRole === 'Owner'
                      ? 'bg-[#ffb95f]/15 border-[#ffb95f]/40 text-[#ffb95f]'
                      : change.userRole === 'Editor'
                      ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#4edea3]'
                      : change.userRole === 'Viewer'
                      ? 'bg-[#03b5d3]/15 border-[#03b5d3]/40 text-[#4cd7f6]'
                      : 'bg-[#1e1f25] border-[#3c4a42] text-[#bbcabf]'
                  }`}
                >
                  {change.userRole || 'Owner'}
                </span>
                <span className="text-[#86948a]">—</span>
                <span className="text-[#bbcabf]">
                  {isAdded
                    ? 'created variable'
                    : isModified
                    ? 'updated value for'
                    : isDeleted
                    ? 'removed variable'
                    : isProjectDeleted
                    ? 'closed project workspace'
                    : change.action}
                </span>
                <code className="text-[#4edea3] font-mono text-[11px]">{change.key}</code>
              </div>

              {/* Code diff container */}
              {(displayNew || displayOld) && (
                <div className="rounded-lg bg-[#0d0e13] border border-[#3c4a42]/70 p-3 space-y-1.5 text-[11px]">
                  {isAdded && displayNew && (
                    <div className="text-[#4edea3] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="select-none text-[#10b981] font-bold">+</span>
                        <span className="select-all break-all">{displayNew}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(`${change.id}-new`, displayNew)}
                        title="Copy value"
                        className="opacity-0 group-hover:opacity-100 text-[#86948a] hover:text-[#4edea3] p-1 transition-opacity shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === `${change.id}-new` ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  )}

                  {isModified && (
                    <>
                      {displayOld && (
                        <div className="text-rose-400 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="select-none text-rose-500 font-bold">-</span>
                            <span className="select-all break-all">{displayOld}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(`${change.id}-old`, displayOld)}
                            title="Copy previous value"
                            className="opacity-0 group-hover:opacity-100 text-[#86948a] hover:text-[#e3e1e9] p-1 transition-opacity shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedId === `${change.id}-old` ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      )}
                      {displayNew && (
                        <div className="text-[#4edea3] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="select-none text-[#10b981] font-bold">+</span>
                            <span className="select-all break-all">{displayNew}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(`${change.id}-new`, displayNew)}
                            title="Copy new value"
                            className="opacity-0 group-hover:opacity-100 text-[#86948a] hover:text-[#4edea3] p-1 transition-opacity shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedId === `${change.id}-new` ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {(isDeleted || isProjectDeleted) && displayOld && (
                    <div className="text-rose-400 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="select-none text-rose-500 font-bold">-</span>
                        <span className="select-all break-all">{displayOld}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(`${change.id}-old`, displayOld)}
                        title="Copy removed value"
                        className="opacity-0 group-hover:opacity-100 text-[#86948a] hover:text-[#e3e1e9] p-1 transition-opacity shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === `${change.id}-old` ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#86948a] pt-1.5 border-t border-[#3c4a42]/30">
                <span>Account: {change.changedBy}</span>
                <span className="text-[10px] text-[#86948a]">
                  {new Date(change.changedAt).toLocaleDateString()} at {new Date(change.changedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
