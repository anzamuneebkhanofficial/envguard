'use client';

import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  onExportEnv: () => Promise<string>;
  onExportExample: () => Promise<string>;
}

export function ExportModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  onExportEnv,
  onExportExample,
}: ExportModalProps) {
  const [isExportingEnv, setIsExportingEnv] = useState(false);
  const [isExportingExample, setIsExportingExample] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ filename: string; content: string } | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Downloaded ${filename} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadEnv = async () => {
    setIsExportingEnv(true);
    setErrorMsg(null);
    try {
      // Always fetches the latest backend state directly
      const content = await onExportEnv();
      downloadFile('.env', content);
      setPreviewContent({ filename: '.env', content });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to export .env');
    } finally {
      setIsExportingEnv(false);
    }
  };

  const handleDownloadExample = async () => {
    setIsExportingExample(true);
    setErrorMsg(null);
    try {
      // Always fetches the latest backend state directly
      const content = await onExportExample();
      downloadFile('.env.example', content);
      setPreviewContent({ filename: '.env.example', content });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to export .env.example');
    } finally {
      setIsExportingExample(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setPreviewContent(null);
          setErrorMsg(null);
          setDownloadSuccess(null);
        }
        onOpenChange(v);
      }}
      title="Export Variables"
      description="Export the current project variables as .env or .env.example."
    >
      <div className="space-y-4 pt-1 font-sans text-xs">
        {/* Success Alert */}
        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#4edea3] font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: .env with actual current values */}
          <div className="p-4 rounded-xl border border-[#3c4a42] bg-[#0d0e13] flex flex-col justify-between space-y-3 hover:border-[#10b981]/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-[#e3e1e9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#10b981] text-[18px]">download</span>
                  .env
                </span>
                <Badge variant="added">Live Values</Badge>
              </div>
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Contains all latest project variables with their <strong>real current values</strong>.
              </p>
              <div className="p-2 rounded bg-[#1a1b21] border border-[#3c4a42]/50 text-[11px] font-mono text-[#86948a]">
                Private file for local backend/frontend execution.
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon="download"
              onClick={handleDownloadEnv}
              loading={isExportingEnv}
              className="w-full justify-center"
            >
              Download .env
            </Button>
          </div>

          {/* Card 2: .env.example with safe placeholders */}
          <div className="p-4 rounded-xl border border-[#3c4a42] bg-[#0d0e13] flex flex-col justify-between space-y-3 hover:border-[#03b5d3]/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-[#e3e1e9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">description</span>
                  .env.example
                </span>
                <Badge variant="standard">Git Safe</Badge>
              </div>
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Contains safe placeholder values (e.g. <code>your-api-url</code>). <strong>Never exposes real secrets.</strong>
              </p>
              <div className="p-2 rounded bg-[#1a1b21] border border-[#3c4a42]/50 text-[11px] font-mono text-[#86948a]">
                Shareable template safe for source control commit.
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon="description"
              onClick={handleDownloadExample}
              loading={isExportingExample}
              className="w-full justify-center"
            >
              Download .env.example
            </Button>
          </div>
        </div>

        {/* Live Export Preview */}
        {previewContent && (
          <div className="mt-4 pt-3 border-t border-[#3c4a42]/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#bbcabf]">
              <span>Generated File Preview: <strong>{previewContent.filename}</strong></span>
              <span className="text-[#86948a] text-[10px]">Latest from server</span>
            </div>
            <pre className="p-3 rounded-lg bg-[#0d0e13] border border-[#3c4a42] text-[11px] font-mono text-[#bbcabf] max-h-40 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
              {previewContent.content}
            </pre>
          </div>
        )}

        <div className="pt-2 text-[11px] text-[#86948a] font-mono text-center">
          Project: <span className="text-[#e3e1e9]">{projectName}</span> • Always generated directly from latest database state.
        </div>
      </div>
    </Dialog>
  );
}
