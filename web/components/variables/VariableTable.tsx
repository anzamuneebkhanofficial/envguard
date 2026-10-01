'use client';

import React, { useState } from 'react';
import { VariableStatusBadge } from './VariableStatusBadge';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { formatRelativeTime } from '../../utils/format';
import type { VariableItem } from '../../lib/variables';

interface VariableTableProps {
  // Server already paginated — receives only the current page slice
  variables: VariableItem[];
  isLoading?: boolean;
  onEdit?: (variable: VariableItem) => void;
  onDelete?: (key: string) => void;
  onViewDiff?: (key: string) => void;
  onOpenSyncModal?: () => void;
  onOpenExportModal?: () => void;
  // Pagination state driven from parent (server-side)
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function VariableTable({
  variables,
  isLoading = false,
  onEdit,
  onDelete,
  onViewDiff,
  onOpenSyncModal,
  onOpenExportModal,
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: VariableTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Default is masked (hidden). Any revealed key is explicitly stored in revealedKeys.
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleVisibility = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllVisibility = () => {
    if (revealedKeys.size > 0) {
      setRevealedKeys(new Set());
    } else {
      setRevealedKeys(new Set(variables.map((v) => v.key)));
    }
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="rounded-xl border border-[#3c4a42] overflow-hidden bg-[#0d0e13] shadow-sm">
      {/* Table Section Header */}
      <div className="p-4 border-b border-[#3c4a42] bg-[#1a1b21] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-semibold text-sm text-[#e3e1e9]">Project Variables</h2>
          {isLoading ? (
            <span className="w-16 h-5 rounded bg-[#1e1f25] animate-pulse inline-block" />
          ) : (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1e1f25] text-[#86948a] border border-[#3c4a42]">
              {totalRecords} {totalRecords === 1 ? 'variable' : 'variables'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {variables.length > 0 && (
            <button
              onClick={toggleAllVisibility}
              className="text-xs font-mono text-[#bbcabf] hover:text-[#e3e1e9] px-2.5 py-1 rounded bg-[#1e1f25] border border-[#3c4a42] flex items-center gap-1.5 transition-colors"
              title="Toggle reveal of all values"
            >
              <span className="material-symbols-outlined text-[15px]">
                {revealedKeys.size > 0 ? 'visibility_off' : 'visibility'}
              </span>
              <span>{revealedKeys.size > 0 ? 'Mask All' : 'Reveal All'}</span>
            </button>
          )}

          {onOpenExportModal && (
            <Button variant="secondary" size="sm" icon="download" onClick={onOpenExportModal}>
              Export Variables
            </Button>
          )}
          {onOpenSyncModal && (
            <Button variant="primary" size="sm" icon="add" onClick={onOpenSyncModal}>
              Add or Sync Variables
            </Button>
          )}
        </div>
      </div>

      {/* Table Content — stable min-h prevents layout shift */}
      <div className="overflow-x-auto min-h-[200px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#3c4a42] bg-[#1a1b21]/60 text-[#86948a] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">VARIABLE NAME</th>
              <th className="py-3 px-4 font-medium">VALUE</th>
              <th className="py-3 px-4 font-medium">PROTECTION</th>
              <th className="py-3 px-4 font-medium">LAST UPDATED</th>
              <th className="py-3 px-4 font-medium">UPDATED BY</th>
              <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3c4a42]/40 text-xs font-mono">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="h-12 hover:bg-[#1a1b21]/40 transition-colors">
                  <td className="py-3.5 px-4"><div className="h-4 w-36 rounded bg-[#1e1f25] animate-pulse" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-32 rounded bg-[#1e1f25] animate-pulse" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-16 rounded bg-[#1e1f25] animate-pulse" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 rounded bg-[#1e1f25] animate-pulse" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 rounded bg-[#1e1f25] animate-pulse" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-6 w-20 rounded bg-[#1e1f25] animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : variables.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#86948a]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-[#86948a]">vpn_key</span>
                    <span className="text-sm font-medium text-[#e3e1e9]">No variables in this project yet</span>
                    <p className="text-xs text-[#bbcabf] max-w-sm mx-auto">
                      Add your first environment variable or import them using the sync button.
                    </p>
                    {onOpenSyncModal && (
                      <Button variant="primary" size="sm" icon="add" onClick={onOpenSyncModal} className="mt-2">
                        Add Variables
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              variables.map((v) => {
                const isCopied = copiedKey === v.key;
                const isRevealed = revealedKeys.has(v.key);
                const displayValue = isRevealed ? (v.value || '(empty)') : (v.maskedValue || '••••••••');

                return (
                  <tr
                    key={v.id || v.key}
                    onClick={() => toggleVisibility(v.key)}
                    className="hover:bg-[#1a1b21]/70 group transition-colors duration-100 cursor-pointer"
                  >
                    {/* KEY NAME */}
                    <td className="py-3.5 px-4 font-medium text-[#e3e1e9]">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${v.isCritical ? 'text-[#ffb95f]' : 'text-[#86948a]'}`}>
                          {v.isCritical ? 'lock' : 'key'}
                        </span>
                        <span className="text-[#e3e1e9] group-hover:text-[#4edea3] transition-colors">{v.key}</span>
                      </div>
                    </td>

                    {/* VALUE (REVEALABLE / COPYABLE) */}
                    <td className="py-3.5 px-4 text-[#bbcabf]">
                      <div className="flex items-center gap-2 max-w-md">
                        <span
                          className={`px-2 py-0.5 rounded border text-[11px] select-all max-w-[260px] truncate ${
                            !isRevealed
                              ? 'bg-[#1a1b21] border-[#3c4a42] text-[#86948a]'
                              : 'bg-[#10b981]/10 border-[#10b981]/30 text-[#4edea3]'
                          }`}
                          title={!isRevealed ? 'Value masked — click to reveal' : v.value}
                        >
                          {displayValue}
                        </span>

                        {/* Visibility Eye Toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleVisibility(v.key); }}
                          title={isRevealed ? 'Hide value' : 'Reveal value'}
                          className="text-[#86948a] hover:text-[#e3e1e9] p-0.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isRevealed ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>

                        {/* Copy Value Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(v.key, v.value); }}
                          title="Copy actual value"
                          className="opacity-0 group-hover:opacity-100 text-[#86948a] hover:text-[#4edea3] p-0.5 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isCopied ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* SENSITIVITY */}
                    <td className="py-3.5 px-4">
                      <VariableStatusBadge isCritical={v.isCritical} />
                    </td>

                    {/* LAST MODIFIED */}
                    <td className="py-3.5 px-4 text-[#bbcabf] text-[11px]">
                      {formatRelativeTime(v.lastChangedAt)}
                    </td>

                    {/* SOURCE */}
                    <td className="py-3.5 px-4 text-[#86948a] text-[11px]">
                      {v.lastChangedBy || '—'}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                        {onViewDiff && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onViewDiff(v.key); }}
                            className="h-7 text-xs text-[#4cd7f6] hover:text-[#4cd7f6] hover:bg-[#03b5d3]/10"
                          >
                            View Change
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onEdit(v); }}
                            className="h-7 text-xs text-[#bbcabf]"
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(v.key); }}
                            title="Remove variable"
                            className="p-1 rounded text-[#86948a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reusable Pagination Component — server-driven */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 20, 50]}
        itemLabel="variables"
        isLoading={isLoading}
      />
    </div>
  );
}
