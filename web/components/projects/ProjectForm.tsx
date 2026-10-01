'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, type ProjectFormValues } from '../../validators/project';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Project',
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-mono text-[#bbcabf] mb-1.5">
          PROJECT NAME <span className="text-[#10b981]">*</span>
        </label>
        <Input
          {...register('name')}
          placeholder="e.g. my-express-api, billing-worker"
          icon="folder"
          error={errors.name?.message}
          autoFocus
        />
        <p className="text-[11px] text-[#86948a] font-mono mt-1">
          Alphanumeric, hyphens, and underscores only.
        </p>
      </div>

      <div>
        <label className="block text-xs font-mono text-[#bbcabf] mb-1.5">
          DESCRIPTION (OPTIONAL)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Brief description of the service and environment targets..."
          className="w-full bg-[#1a1b21] text-[#e3e1e9] placeholder-[#86948a] text-sm rounded-lg border border-[#3c4a42] p-3 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-colors"
        />
        {errors.description && (
          <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting} icon="add">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
