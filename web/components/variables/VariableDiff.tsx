'use client';

import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface VariableDiffProps {
  variableKey: string;
  action: 'created' | 'updated' | 'deleted' | 'synced' | string;
  oldValue?: string;
  newValue?: string;
  oldValueMasked?: string;
  newValueMasked?: string;
  changedBy?: string;
  changedAt?: string;
}

export function VariableDiff({
  variableKey,
  action,
  oldValue,
  newValue,
  oldValueMasked,
  newValueMasked,
  changedBy,
  changedAt,
}: VariableDiffProps) {
  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

  // Resolve best readable values
  const beforeVal = oldValue !== undefined && oldValue !== '' ? oldValue : oldValueMasked;
  const afterVal = newValue !== undefined && newValue !== '' ? newValue : newValueMasked;

  const handleCopyBefore = () => {
    if (beforeVal) {
      navigator.clipboard.writeText(beforeVal);
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    }
  };

  const handleCopyAfter = () => {
    if (afterVal) {
      navigator.clipboard.writeText(afterVal);
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  return (
    <Card className="border-[#3c4a42] bg-[#0d0e13] font-mono text-xs overflow-hidden">
      <div className="bg-[#1a1b21] p-3 border-b border-[#3c4a42] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#e3e1e9] font-semibold text-sm">{variableKey}</span>
          <Badge
            variant={
              action === 'created'
                ? 'added'
                : action === 'updated'
                ? 'modified'
                : 'deleted'
            }
          >
            {action === 'created' ? '+ ADDED' : action === 'updated' ? '~ MODIFIED' : '- DELETED'}
          </Badge>
        </div>

        {changedAt && <span className="text-[#86948a] text-[11px]">{changedAt}</span>}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Side by side diff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Column */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#86948a] text-[10px] uppercase font-semibold">Previous Value</span>
              {beforeVal && (
                <button
                  onClick={handleCopyBefore}
                  className="text-[10px] text-[#86948a] hover:text-[#e3e1e9] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedBefore ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedBefore ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-[#1a1b21] border border-[#3c4a42] min-h-[46px] flex items-center">
              {action === 'created' ? (
                <span className="text-[#86948a] italic flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">add_circle_outline</span>
                  Initial creation (No previous value)
                </span>
              ) : beforeVal ? (
                <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 select-all break-all">
                  - {beforeVal}
                </span>
              ) : (
                <span className="text-[#86948a] italic">&lt;Not defined&gt;</span>
              )}
            </div>
          </div>

          {/* After Column */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#86948a] text-[10px] uppercase font-semibold">New Value</span>
              {afterVal && (
                <button
                  onClick={handleCopyAfter}
                  className="text-[10px] text-[#86948a] hover:text-[#4edea3] flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedAfter ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedAfter ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-[#1a1b21] border border-[#3c4a42] min-h-[46px] flex items-center">
              {action === 'deleted' ? (
                <span className="text-rose-400 italic flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">remove_circle_outline</span>
                  Removed from project
                </span>
              ) : afterVal ? (
                <span className="text-[#4edea3] bg-[#10b981]/10 px-2 py-1 rounded border border-[#10b981]/20 select-all break-all">
                  + {afterVal}
                </span>
              ) : (
                <span className="text-[#86948a] italic">&lt;Empty&gt;</span>
              )}
            </div>
          </div>
        </div>

        {changedBy && (
          <div className="text-[11px] text-[#86948a] flex items-center justify-between pt-2 border-t border-[#3c4a42]/40">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">account_circle</span>
              <span>Updated by <span className="text-[#e3e1e9] font-medium">{changedBy}</span></span>
            </div>
            <span className="text-[10px] text-[#4cd7f6] bg-[#03b5d3]/10 px-2 py-0.5 rounded border border-[#03b5d3]/20">
              Authorized Member Audit
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
