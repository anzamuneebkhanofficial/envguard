'use client';

import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ChangeFiltersProps {
  keyFilter: string;
  onKeyFilterChange: (val: string) => void;
  actionFilter?: 'created' | 'updated' | 'deleted';
  onActionFilterChange: (action?: 'created' | 'updated' | 'deleted') => void;
  onReset: () => void;
}

export function ChangeFilters({
  keyFilter,
  onKeyFilterChange,
  actionFilter,
  onActionFilterChange,
  onReset,
}: ChangeFiltersProps) {
  const actions: Array<{ label: string; value?: 'created' | 'updated' | 'deleted' }> = [
    { label: 'All Actions', value: undefined },
    { label: '+ Added', value: 'created' },
    { label: '~ Modified', value: 'updated' },
    { label: '- Deleted', value: 'deleted' },
  ];

  return (
    <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Key search */}
        <div className="w-64">
          <Input
            icon="search"
            placeholder="Search variables..."
            value={keyFilter}
            onChange={(e) => onKeyFilterChange(e.target.value)}
          />
        </div>

        {/* Action pills */}
        <div className="flex items-center gap-1.5 font-mono">
          {actions.map((act) => {
            const isSelected = actionFilter === act.value;
            return (
              <button
                key={act.label}
                onClick={() => onActionFilterChange(act.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#1e1f25] border-[#10b981] text-[#4edea3]'
                    : 'bg-[#121318] border-[#3c4a42] text-[#bbcabf] hover:text-[#e3e1e9]'
                }`}
              >
                {act.label}
              </button>
            );
          })}
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onReset} className="text-[#86948a] hover:text-[#e3e1e9]">
        Reset Filters
      </Button>
    </div>
  );
}
