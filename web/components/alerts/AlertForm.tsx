'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { cn } from '../../utils/cn';
import type { AlertPreferenceItem } from '../../lib/alerts';

interface AlertFormProps {
  initialPreference?: AlertPreferenceItem | null;
  readOnly?: boolean;
  className?: string;
  onSave: (values: {
    notifyOnCriticalChange: boolean;
    webhookUrl?: string;
    emailNotifications: boolean;
  }) => Promise<void>;
  onTestWebhook: (webhookUrl: string) => Promise<{ message: string; status: number }>;
}

export function AlertForm({ initialPreference, readOnly = false, className, onSave, onTestWebhook }: AlertFormProps) {
  const [notifyOnCriticalChange, setNotifyOnCriticalChange] = useState(
    initialPreference?.notifyOnCriticalChange ?? true
  );
  const [webhookUrl, setWebhookUrl] = useState(initialPreference?.webhookUrl ?? '');
  const [emailNotifications, setEmailNotifications] = useState(
    initialPreference?.emailNotifications ?? false
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(
    null
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        notifyOnCriticalChange,
        webhookUrl: webhookUrl.trim() || undefined,
        emailNotifications,
      });
      setTestResult({ success: true, message: 'Alert preferences saved successfully!' });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to save preferences',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      setTestResult({ success: false, message: 'Please enter a webhook URL first' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestWebhook(webhookUrl);
      setTestResult({ success: true, message: `${res.message} (HTTP ${res.status})` });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Webhook dispatch test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div>
          <CardTitle>
            <span className="material-symbols-outlined text-[#ffb95f]">notifications_active</span>
            Alert & Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure real-time notifications dispatched when critical environment variables drift or change.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Read-Only Notice for non-owners */}
          {readOnly && (
            <div className="p-3.5 rounded-xl border border-[#3c4a42] bg-[#1a1b21] text-xs font-mono text-[#86948a] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">info</span>
              <span>Only the project owner can configure webhook URLs and notification preferences. (View-Only)</span>
            </div>
          )}

          {/* Critical Toggle */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[#3c4a42] bg-[#0d0e13]">
            <input
              type="checkbox"
              id="notifyOnCritical"
              checked={notifyOnCriticalChange}
              disabled={readOnly}
              onChange={(e) => !readOnly && setNotifyOnCriticalChange(e.target.checked)}
              className="mt-1 rounded border-[#3c4a42] bg-[#1a1b21] text-[#10b981] focus:ring-[#06b6d4] disabled:opacity-50"
            />
            <label htmlFor="notifyOnCritical" className={`select-none text-xs ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <span className="font-semibold text-sm text-[#e3e1e9] block">
                Trigger Alerts on Critical Variable Changes
              </span>
              <span className="text-[#bbcabf] block mt-0.5 font-sans">
                Automatically dispatches events when variables matching critical patterns (STRIPE, DB,
                SECRET, TOKEN) are created, updated, or removed.
              </span>
            </label>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#bbcabf]">
              WEBHOOK ENDPOINT URL (SLACK / DISCORD / CUSTOM API)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="url"
                value={webhookUrl}
                disabled={readOnly}
                onChange={(e) => !readOnly && setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                icon="webhook"
              />
              {!readOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleTest}
                  loading={isTesting}
                  disabled={!webhookUrl}
                >
                  Test Webhook
                </Button>
              )}
            </div>
            <p className="text-[11px] text-[#86948a] font-sans">
              Sends an HTTP POST with event metadata. Zero secret values are ever included.
            </p>
          </div>

          {/* Email Notifications */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[#3c4a42] bg-[#0d0e13]">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={emailNotifications}
              disabled={readOnly}
              onChange={(e) => !readOnly && setEmailNotifications(e.target.checked)}
              className="mt-1 rounded border-[#3c4a42] bg-[#1a1b21] text-[#10b981] focus:ring-[#06b6d4] disabled:opacity-50"
            />
            <label htmlFor="emailNotifications" className={`select-none text-xs ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <span className="font-semibold text-sm text-[#e3e1e9] block">
                Enable Email Notifications (Nodemailer SMTP)
              </span>
              <span className="text-[#bbcabf] block mt-0.5 font-sans">
                Sends alert digests to the registered account email address upon critical variable drift.
              </span>
            </label>
          </div>

          {/* Result Alert */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                testResult.success
                  ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#4edea3]'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {testResult.success ? 'check_circle' : 'error'}
              </span>
              <span>{testResult.message}</span>
            </div>
          )}

          {!readOnly && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" loading={isSaving} icon="save">
                Save Preferences
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
