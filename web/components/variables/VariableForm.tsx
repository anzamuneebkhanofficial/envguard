'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { VariableItem } from '../../lib/variables';

interface VariableFormProps {
  initialVariable?: VariableItem | null;
  onSave: (key: string, values: { value?: string; isCritical?: boolean }) => Promise<void>;
  onCancel?: () => void;
}

export function VariableForm({ initialVariable, onSave, onCancel }: VariableFormProps) {
  const [value, setValue] = useState('');
  const [isCritical, setIsCritical] = useState(initialVariable?.isCritical ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialVariable) return;

    setIsSubmitting(true);
    try {
      await onSave(initialVariable.key, {
        value: value.trim() ? value : undefined,
        isCritical,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
      <div>
        <label className="block text-[#bbcabf] mb-1.5">VARIABLE KEY</label>
        <div className="h-9 px-3 rounded-lg bg-[#121318] border border-[#3c4a42] flex items-center text-[#e3e1e9] font-medium">
          {initialVariable?.key}
        </div>
      </div>

      <div>
        <label className="block text-[#bbcabf] mb-1.5">
          NEW SECRET VALUE (OPTIONAL)
        </label>
        <Input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Leave blank to preserve current masked value"
          autoComplete="new-password"
        />
        <p className="text-[11px] text-[#86948a] mt-1 font-sans">
          EnvGuard automatically masks this value in memory. The plaintext secret is never written to disk or database.
        </p>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCritical}
            onChange={(e) => setIsCritical(e.target.checked)}
            className="rounded border-[#3c4a42] bg-[#1a1b21] text-[#10b981] focus:ring-[#06b6d4]"
          />
          <span className="text-[#e3e1e9]">Flag as Critical Secret</span>
        </label>
        <p className="text-[11px] text-[#86948a] ml-6 mt-0.5 font-sans">
          Critical secrets trigger immediate webhook dispatches and team notification emails when modified.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#3c4a42]/40 font-sans">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting} icon="check">
          Update Variable
        </Button>
      </div>
    </form>
  );
}
