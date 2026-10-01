'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { VariableTable } from '@/components/variables/VariableTable';
import { VariableForm } from '@/components/variables/VariableForm';
import { VariableDiff } from '@/components/variables/VariableDiff';
import { ChangeTimeline } from '@/components/changes/ChangeTimeline';
import { ChangeChart } from '@/components/changes/ChangeChart';
import { SyncModal } from '@/components/variables/SyncModal';
import { ExportModal } from '@/components/variables/ExportModal';
import { useProject } from '@/hooks/useProjects';
import { useVariables } from '@/hooks/useVariables';
import { useVariablesPaginated } from '@/hooks/useVariablesPaginated';
import { useChanges } from '@/hooks/useChanges';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/utils/format';
import type { VariableItem } from '@/lib/variables';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const { user } = useAuth();
  const { project, isLoading: isProjectLoading, isError: isProjectError } = useProject(projectId);
  const {
    syncVariables,
    updateVariable,
    deleteVariable,
    exportEnv,
    exportEnvExample,
  } = useVariables(projectId);

  // Server-side paginated variables for the table
  const {
    variables,
    total: variablesTotal,
    page: variablesPage,
    limit: variablesLimit,
    totalPages: variablesTotalPages,
    isLoading: isVariablesLoading,
    setPage: setVariablesPage,
    setLimit: setVariablesLimit,
    setSearch: setVariablesSearch,
    invalidate: invalidateVariables,
  } = useVariablesPaginated(projectId);

  const {
    changes,
    total: changesTotal,
    page: changesPage,
    totalPages: changesTotalPages,
    setPage: setChangesPage,
    isLoading: isChangesLoading,
  } = useChanges(projectId, { limit: 8 });

  const [search, setSearch] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<VariableItem | null>(null);
  const [diffVarKey, setDiffVarKey] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  // Search drives server-side variable filter
  const handleVariableSearch = (val: string) => {
    setSearch(val);
    setVariablesSearch(val);
  };

  // If user has been removed or project does not exist
  if (!isProjectLoading && (isProjectError || !project)) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header projectName="Access Restricted" />
        <div className="flex-1 p-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <span className="material-symbols-outlined text-[32px]">no_accounts</span>
          </div>
          <h2 className="text-xl font-bold text-[#e3e1e9]">Access Revoked or Not Found</h2>
          <p className="text-xs text-[#bbcabf] font-mono leading-relaxed">
            You no longer have access to this project workspace. Your invitation may have been removed by the project owner or the project was deleted.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              icon="arrow_back"
              onClick={() => (window.location.href = '/projects')}
            >
              Return to All Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User role resolution
  const isOwner = project && user && String(project.ownerId) === String(user.id);
  const userMember = project?.members?.find((m) => String(m.userId) === String(user?.id));
  const userRole = isOwner ? 'owner' : (userMember?.role || 'viewer');
  const isDeletedProject = Boolean(project?.isDeleted);
  const canEdit = !isDeletedProject && (userRole === 'owner' || userRole === 'editor');

  // Metrics use server totals where available
  const totalCount = variablesTotal;
  const criticalCount = variables.filter((v) => v.isCritical).length;
  const lastChange = changes[0];
  const lastChangeText = lastChange ? formatRelativeTime(lastChange.changedAt) : 'No drift recorded';
  const lastChangeDesc = lastChange ? `${lastChange.key} ${lastChange.action}` : 'Variables in sync';

  const cliCommand = `npx envg-upload --file .env --project ${project?.name || projectId} --api http://localhost:4000`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const selectedDiffChange = changes.find((c) => c.key === diffVarKey);
  const selectedVar = variables.find((v) => v.key === diffVarKey);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <Header
        projectName={project?.name || 'Project Detail'}
        searchQuery={search}
        onSearchChange={handleVariableSearch}
        onOpenSyncModal={canEdit ? () => setIsSyncModalOpen(true) : undefined}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Canvas */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Soft-deleted Project Notice */}
        {isDeletedProject && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <span className="material-symbols-outlined text-[18px]">info</span>
              This project is no longer available. It has been removed by the owner.
            </div>
            <p className="text-[#bbcabf] pl-6">
              <span className="text-[#e3e1e9] font-medium">Owner Notice:</span>{' '}
              {project?.deletionNote || 'This project has been archived or marked completed by the administrator.'}
            </p>
            <div className="text-[11px] text-[#86948a] pl-6 pt-1">
              All variable values are in read-only audit mode, and the full activity history below remains intact.
            </div>
          </div>
        )}

        {/* Project Overview & Creator Banner */}
        <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                {isProjectLoading ? (
                  <div className="h-6 w-44 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  <h1 className="text-xl font-bold text-[#e3e1e9] tracking-tight">{project?.name || 'Project'}</h1>
                )}
                <Badge variant={userRole === 'owner' ? 'added' : userRole === 'editor' ? 'standard' : 'secondary'}>
                  YOUR ROLE: {userRole.toUpperCase()}
                </Badge>
              </div>
              {isProjectLoading ? (
                <div className="h-4 w-72 rounded bg-[#1e1f25] animate-pulse mt-2" />
              ) : (
                <p className="text-xs text-[#bbcabf] mt-1 max-w-2xl">
                  {project?.description || 'Environment variables and change tracking for this workspace.'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="primary" icon="add" onClick={() => setIsSyncModalOpen(true)}>
                  Add or Sync Variables
                </Button>
              )}
              <Button
                variant="secondary"
                icon="tune"
                onClick={() => (window.location.href = `/projects/${projectId}/settings`)}
              >
                Team & Settings
              </Button>
            </div>
          </div>

          {/* Creator & Access Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#3c4a42]/50 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#10b981] text-[18px]">verified_user</span>
              <div>
                <div className="text-[10px] text-[#86948a] uppercase">Created By</div>
                <div className="text-[#e3e1e9] font-medium">
                  {isProjectLoading ? (
                    <span className="inline-block w-28 h-3.5 rounded bg-[#1e1f25] animate-pulse" />
                  ) : (
                    <>
                      {project?.ownerName || 'Creator'} <span className="text-[#bbcabf] text-[11px]">({project?.ownerEmail || 'Owner'})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">calendar_today</span>
              <div>
                <div className="text-[10px] text-[#86948a] uppercase">Created On</div>
                <div className="text-[#e3e1e9]">
                  {isProjectLoading ? (
                    <span className="inline-block w-20 h-3.5 rounded bg-[#1e1f25] animate-pulse" />
                  ) : project?.createdAt ? (
                    new Date(project.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                  ) : (
                    'Recently'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb95f] text-[18px]">group</span>
              <div>
                <div className="text-[10px] text-[#86948a] uppercase">Access Control</div>
                <div className="text-[#e3e1e9]">
                  {isProjectLoading ? (
                    <span className="inline-block w-24 h-3.5 rounded bg-[#1e1f25] animate-pulse" />
                  ) : (
                    `${project?.members?.length || 1} team ${(project?.members?.length || 1) === 1 ? 'member' : 'members'} with access`
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewer Role Notice if Read-Only */}
        {!canEdit && (
          <div className="rounded-lg border border-[#3c4a42] bg-[#1a1b21] p-3 text-xs font-mono text-[#bbcabf] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">visibility</span>
              <span>Viewer Role: You have read-only access to view variables and audit history.</span>
            </div>
            <Badge variant="standard">VIEWER</Badge>
          </div>
        )}

        {/* Metric Cards Grid (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Variables */}
          <Card className="hover:border-[#10b981]/50 transition-colors">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#86948a] font-mono">
                <span>STORED VARIABLES</span>
                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              </div>
              <div className="text-3xl font-bold font-mono text-[#e3e1e9]">
                {isVariablesLoading ? (
                  <div className="h-9 w-12 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  totalCount
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#4edea3] font-mono">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>Active project keys</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Critical Keys */}
          <Card className="hover:border-[#ffb95f]/50 transition-colors">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#86948a] font-mono">
                <span>PROTECTED SECRETS</span>
                <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">shield</span>
              </div>
              <div className="text-3xl font-bold font-mono text-[#ffb95f] flex items-baseline gap-2">
                {isVariablesLoading ? (
                  <div className="h-9 w-12 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  <>
                    {criticalCount}
                    <span className="text-xs font-normal text-[#86948a]">flagged</span>
                  </>
                )}
              </div>
              <div className="text-xs text-[#bbcabf] font-mono truncate">
                {isVariablesLoading ? (
                  <div className="h-3.5 w-32 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  variables.filter((v) => v.isCritical).map((v) => v.key).slice(0, 3).join(', ') || 'No sensitive keys'
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Last Change */}
          <Card className="hover:border-[#03b5d3]/50 transition-colors">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#86948a] font-mono">
                <span>LATEST CHANGE</span>
                <span className="material-symbols-outlined text-[18px] text-[#4cd7f6]">history</span>
              </div>
              <div className="text-3xl font-bold font-mono text-[#e3e1e9]">
                {isChangesLoading ? (
                  <div className="h-9 w-28 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  lastChangeText
                )}
              </div>
              <div className="text-xs text-[#bbcabf] font-mono truncate">
                {isChangesLoading ? (
                  <div className="h-3.5 w-24 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  lastChangeDesc
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Export Variables */}
          <Card className="hover:border-[#10b981]/50 transition-colors">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#86948a] font-mono">
                <span>EXPORT VARIABLES</span>
                <span className="material-symbols-outlined text-[18px] text-[#4edea3]">download</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#e3e1e9] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-[#10b981]">file_download</span>
                .env / .example
              </div>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1 text-xs text-[#4edea3] hover:underline font-mono"
              >
                <span>Export Variables</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Terminal Upload Command or View-Only Banner */}
        {canEdit ? (
          <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-4 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#292a2f] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[15px]">terminal</span>
                </div>
                <span className="font-semibold text-sm text-[#e3e1e9]">Terminal Upload Command</span>
                <Badge variant="standard">v1.4.2</Badge>
              </div>
              <span className="text-[#bbcabf] text-[11px]">
                Project Target: <span className="text-[#4edea3] font-semibold">{project?.name || projectId}</span>
              </span>
            </div>

            <div className="rounded-lg bg-[#0d0e13] border border-[#3c4a42] p-3 text-[#e3e1e9] flex items-center justify-between gap-3 overflow-x-auto">
              <code className="text-[#4cd7f6] select-all">$ {cliCommand}</code>
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
          </div>
        ) : (
          <div className="rounded-xl border border-[#3c4a42]/60 bg-[#1a1b21]/70 p-4 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">visibility</span>
              <span className="text-[#bbcabf]">
                You have <strong className="text-[#e3e1e9]">Viewer</strong> access to this project. You can inspect variables, download templates, and view history.
              </span>
            </div>
            <Badge variant="standard">Read-Only Mode</Badge>
          </div>
        )}

        {/* Project Variables Table */}
        <VariableTable
          variables={variables}
          isLoading={isVariablesLoading}
          onEdit={canEdit ? (v) => setEditingVar(v) : undefined}
          onDelete={canEdit ? (k) => { deleteVariable(k).then(() => invalidateVariables()); } : undefined}
          onViewDiff={(k) => setDiffVarKey(k)}
          onOpenSyncModal={canEdit ? () => setIsSyncModalOpen(true) : undefined}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          currentPage={variablesPage}
          totalPages={variablesTotalPages}
          totalRecords={variablesTotal}
          pageSize={variablesLimit}
          onPageChange={setVariablesPage}
          onPageSizeChange={setVariablesLimit}
        />

        {/* Activity & Change Drift Analytics (4-in-1 Charts) */}
        {changes.length > 0 && (
          <ChangeChart changes={changes} title="CHANGE DRIFT ANALYTICS" />
        )}

        {/* Recent Activity & Change Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">history</span>
              <h3 className="font-semibold text-sm text-[#e3e1e9]">Recent Activity & Change Log</h3>
              <Badge variant="secondary">Live stream</Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon="arrow_forward"
              onClick={() => (window.location.href = `/projects/${projectId}/history`)}
            >
              View Full History
            </Button>
          </div>

          <ChangeTimeline changes={changes} isLoading={isChangesLoading} />

          <Pagination
            currentPage={changesPage}
            totalPages={changesTotalPages}
            totalRecords={changesTotal}
            pageSize={8}
            onPageChange={setChangesPage}
            isLoading={isChangesLoading}
            itemLabel="activities"
            className="rounded-xl border"
          />
        </div>

        {/* System Status Footer */}
        <div className="pt-6 pb-4 border-t border-[#3c4a42]/40 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#86948a] font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#e3e1e9] font-medium">Safe Sync Active</span>
            <span>•</span>
            <span>Zero Plaintext Secrets</span>
          </div>
          <div>Project Environment: Production</div>
        </div>
      </div>

      {/* Edit Variable Modal */}
      <Dialog
        open={!!editingVar}
        onOpenChange={(open) => !open && setEditingVar(null)}
        title={`Edit Variable: ${editingVar?.key || ''}`}
        description="Modify secret value or sensitivity flag. Values are masked immediately."
      >
        <VariableForm
          initialVariable={editingVar}
          onSave={async (key, values) => {
            await updateVariable({ key, values });
            invalidateVariables();
            setEditingVar(null);
          }}
          onCancel={() => setEditingVar(null)}
        />
      </Dialog>

      {/* View Diff Modal */}
      <Dialog
        open={!!diffVarKey}
        onOpenChange={(open) => !open && setDiffVarKey(null)}
        title={`Variable Change: ${diffVarKey || ''}`}
        description="Audit before/after transparent value recorded for this variable."
      >
        {selectedDiffChange ? (
          <VariableDiff
            variableKey={selectedDiffChange.key}
            action={selectedDiffChange.action}
            oldValue={selectedDiffChange.oldValue}
            newValue={selectedDiffChange.newValue}
            oldValueMasked={selectedDiffChange.oldValueMasked}
            newValueMasked={selectedDiffChange.newValueMasked}
            changedBy={selectedDiffChange.changedBy}
            changedAt={formatRelativeTime(selectedDiffChange.changedAt)}
          />
        ) : selectedVar ? (
          <VariableDiff
            variableKey={selectedVar.key}
            action="created"
            oldValue=""
            newValue={selectedVar.value}
            oldValueMasked=""
            newValueMasked={selectedVar.maskedValue}
            changedBy={selectedVar.lastChangedBy}
            changedAt={formatRelativeTime(selectedVar.lastChangedAt)}
          />
        ) : (
          <div className="p-6 text-center text-xs font-mono text-[#86948a]">
            No recent change history found for {diffVarKey}
          </div>
        )}
      </Dialog>

      {/* Quick Sync Modal */}
      {project && (
        <SyncModal
          open={isSyncModalOpen}
          onOpenChange={setIsSyncModalOpen}
          projectId={project.id}
          projectName={project.name}
          existingVariables={variables}
          onSyncPaste={async (vars) => {
            const res = await syncVariables(vars);
            invalidateVariables();
            return res;
          }}
        />
      )}

      {/* Export Variables Modal (accessible to Owner, Editor, Viewer) */}
      {project && (
        <ExportModal
          open={isExportModalOpen}
          onOpenChange={setIsExportModalOpen}
          projectId={project.id}
          projectName={project.name}
          onExportEnv={exportEnv}
          onExportExample={exportEnvExample}
        />
      )}
    </div>
  );
}
