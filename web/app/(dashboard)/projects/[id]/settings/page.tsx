'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { AlertForm } from '@/components/alerts/AlertForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useProject } from '@/hooks/useProjects';
import { useAlerts } from '@/hooks/useAlerts';
import { useAuth } from '@/hooks/useAuth';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const { user } = useAuth();
  const {
    project,
    isLoading: isProjectLoading,
    updateProject,
    isUpdating,
    addMember,
    isAddingMember,
    removeMember,
    isRemovingMember,
    deleteProject,
    isDeleting,
  } = useProject(projectId);
  const { preference, updatePreference, testWebhook } = useAlerts(projectId);

  const isOwner = project && user && String(project.ownerId) === String(user.id);

  // Edit project state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUpdateMsg, setProjectUpdateMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Invite member state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'editor' | 'viewer'>('editor');
  const [memberMessage, setMemberMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletionNote, setDeletionNote] = useState('');

  // Members pagination state
  const [membersPage, setMembersPage] = useState<number>(1);
  const [membersPageSize, setMembersPageSize] = useState<number>(8);

  const allMembers = project?.members || [];
  const totalMembersPages = Math.ceil(allMembers.length / membersPageSize) || 1;
  const paginatedMembers = React.useMemo(() => {
    const start = (membersPage - 1) * membersPageSize;
    return allMembers.slice(start, start + membersPageSize);
  }, [allMembers, membersPage, membersPageSize]);

  // Initialize edit fields when project loads
  React.useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    }
  }, [project]);

  const handleUpdateProjectDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setProjectUpdateMsg(null);
    try {
      await updateProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
      });
      setProjectUpdateMsg({ success: true, text: 'Project details updated successfully!' });
      setIsEditingProject(false);
      setTimeout(() => setProjectUpdateMsg(null), 3500);
    } catch (err) {
      setProjectUpdateMsg({
        success: false,
        text: err instanceof Error ? err.message : 'Failed to update project details',
      });
    }
  };

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from this project? Their access will be revoked immediately.`)) {
      return;
    }
    setRemovingUserId(userId);
    setMemberMessage(null);
    try {
      await removeMember(userId);
      setMemberMessage({ success: true, text: `Successfully removed ${email} from the project.` });
      setTimeout(() => setMemberMessage(null), 3500);
    } catch (err) {
      setMemberMessage({
        success: false,
        text: err instanceof Error ? err.message : 'Failed to remove member',
      });
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setMemberMessage(null);
    try {
      await addMember({ email: memberEmail.trim(), role: memberRole });
      setMemberMessage({ success: true, text: `Successfully invited ${memberEmail} as ${memberRole}` });
      setMemberEmail('');
      setTimeout(() => setMemberMessage(null), 3500);
    } catch (err) {
      setMemberMessage({
        success: false,
        text: err instanceof Error ? err.message : 'Failed to add member',
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(deletionNote.trim() || undefined);
      router.push('/projects');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header projectName={project?.name || 'Project Settings'} />

      <div className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-[#e3e1e9] tracking-tight">Project Settings</h1>
          <p className="text-xs text-[#bbcabf] font-mono mt-0.5">
            Manage project ownership, team member permissions, notifications, and danger zone actions.
          </p>
        </div>

        {/* 1. Project Ownership, Information & Edit Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <span className="material-symbols-outlined text-[#4edea3]">verified_user</span>
                  Project Ownership & Information
                </CardTitle>
                <CardDescription>
                  Details about who created this project, its configuration, and current status.
                </CardDescription>
              </div>
              {isOwner && !isEditingProject && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="edit"
                  onClick={() => setIsEditingProject(true)}
                >
                  Edit Project
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectUpdateMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono ${
                  projectUpdateMsg.success
                    ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#4edea3]'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {projectUpdateMsg.text}
              </div>
            )}

            {isEditingProject ? (
              <form onSubmit={handleUpdateProjectDetails} className="space-y-4 p-4 rounded-xl bg-[#0d0e13] border border-[#3c4a42]/60">
                <span className="font-mono text-xs font-semibold text-[#e3e1e9] block">
                  Edit Project Details (Owner Only)
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-mono text-[#bbcabf] mb-1">PROJECT NAME</label>
                    <Input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Project Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[#bbcabf] mb-1">DESCRIPTION</label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Brief description of the service or repo..."
                      rows={3}
                      className="w-full bg-[#1a1b21] text-[#e3e1e9] text-xs font-mono rounded-lg border border-[#3c4a42] p-2.5 focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" variant="primary" size="sm" loading={isUpdating} icon="check">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEditingProject(false);
                      setProjectName(project?.name || '');
                      setProjectDescription(project?.description || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0d0e13] border border-[#3c4a42]/60 text-xs">
              <div>
                <span className="text-[#86948a] font-mono block text-[11px] mb-1">PROJECT CREATOR</span>
                {isProjectLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 w-28 rounded bg-[#1e1f25] animate-pulse" />
                    <div className="h-3 w-36 rounded bg-[#1e1f25] animate-pulse" />
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-[#e3e1e9] text-sm block">
                      {project?.ownerName || 'Workspace Owner'}
                    </span>
                    <span className="text-[#bbcabf] text-[11px] truncate block">
                      {project?.ownerEmail || '—'}
                    </span>
                  </>
                )}
              </div>
              <div>
                <span className="text-[#86948a] font-mono block text-[11px] mb-1">CREATOR ROLE</span>
                <Badge variant="added">Project Owner</Badge>
              </div>
              <div>
                <span className="text-[#86948a] font-mono block text-[11px] mb-1">CREATED AT</span>
                {isProjectLoading ? (
                  <div className="h-4 w-24 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  <span className="text-[#e3e1e9] font-mono">
                    {project?.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : '—'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#86948a] font-mono block text-[11px] mb-1">TOTAL MEMBERS</span>
                {isProjectLoading ? (
                  <div className="h-5 w-8 rounded bg-[#1e1f25] animate-pulse" />
                ) : (
                  <span className="text-[#e3e1e9] font-mono font-semibold text-sm">
                    {project?.members?.length || 1}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Team Members & Access Control */}
        <Card className="w-full">
          <CardHeader>
            <div>
              <CardTitle>
                <span className="material-symbols-outlined text-[#4cd7f6]">group</span>
                Team Members & Access Control
              </CardTitle>
              <CardDescription>
                Manage who can view variables, make changes, or manage workspace access.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Invite form - Owner only */}
            {isOwner ? (
              <form onSubmit={handleAddMember} className="space-y-3 p-4 rounded-xl bg-[#0d0e13] border border-[#3c4a42]/60">
                <span className="font-mono text-xs font-semibold text-[#e3e1e9] block">Invite Team Member</span>
                <div className="flex flex-wrap items-end gap-3 text-xs">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block font-mono text-[#bbcabf] mb-1">USER EMAIL ADDRESS</label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      icon="person_add"
                    />
                  </div>

                  <div className="w-52">
                    <label className="block font-mono text-[#bbcabf] mb-1">ASSIGNED ROLE</label>
                    <select
                      value={memberRole}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMemberRole(e.target.value as 'editor' | 'viewer')}
                      className="w-full h-9 bg-[#1a1b21] text-[#e3e1e9] text-xs font-mono rounded-lg border border-[#3c4a42] px-2 focus:outline-none focus:border-[#10b981]"
                    >
                      <option value="editor">Editor (Can add & change variables)</option>
                      <option value="viewer">Viewer (Can only view variables)</option>
                    </select>
                  </div>

                  <Button type="submit" variant="primary" loading={isAddingMember} icon="send">
                    Invite User
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl border border-[#3c4a42] bg-[#1a1b21] text-xs font-mono text-[#86948a] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">info</span>
                <span>You have member access. Only the project owner can invite new members or change roles.</span>
              </div>
            )}

            {memberMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono ${
                  memberMessage.success
                    ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#4edea3]'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {memberMessage.text}
              </div>
            )}

            {/* Existing members table */}
            <div className="space-y-3">
              <span className="font-mono text-xs font-semibold text-[#e3e1e9] block">
                Current Members ({project?.members?.length || 1})
              </span>

              <div className="rounded-xl border border-[#3c4a42]/60 overflow-hidden divide-y divide-[#3c4a42]/40 bg-[#0d0e13]">
                {isProjectLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e1f25] animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-28 rounded bg-[#1e1f25] animate-pulse" />
                          <div className="h-3 w-36 rounded bg-[#1e1f25] animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 w-16 rounded bg-[#1e1f25] animate-pulse" />
                    </div>
                  ))
                ) : paginatedMembers.map((m, idx: number) => {
                  const isMemberOwner = m.role === 'owner';
                  return (
                    <div
                      key={idx}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-[#121318] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-8 h-8 rounded-full bg-[#1e1f25] border border-[#3c4a42] text-[#4edea3] font-bold flex items-center justify-center text-xs">
                          {(m.name || m.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[#e3e1e9] block">
                            {m.name || (isMemberOwner ? project?.ownerName || 'Workspace Owner' : 'Team Member')}
                          </span>
                          <span className="text-[#86948a] text-[11px] block">
                            {m.email || (isMemberOwner ? project?.ownerEmail || '—' : `ID: ${m.userId.slice(-6)}`)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-[#86948a] text-[10px] block uppercase font-mono">Invited By</span>
                          <span className="text-[#bbcabf] font-mono text-[11px]">
                            {m.invitedBy || (isMemberOwner ? 'Original Creator' : project?.ownerName || 'Project Owner')}
                          </span>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="text-[#86948a] text-[10px] block uppercase font-mono">Role</span>
                          <Badge variant={m.role === 'owner' ? 'added' : m.role === 'editor' ? 'modified' : 'standard'}>
                            {m.role === 'owner' ? 'Owner' : m.role === 'editor' ? 'Editor' : 'Viewer'}
                          </Badge>
                        </div>

                        {/* Owner action: Remove member */}
                        {isOwner && !isMemberOwner && (
                          <div className="pl-2 border-l border-[#3c4a42]/40">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="person_remove"
                              loading={isRemovingMember && removingUserId === m.userId}
                              onClick={() => handleRemoveMember(m.userId, m.email || m.name || 'this member')}
                              className="text-xs text-[#86948a] hover:text-rose-400 hover:bg-rose-500/10 h-8"
                              title="Revoke project access"
                            >
                              <span className="hidden sm:inline">Remove</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={membersPage}
                totalPages={totalMembersPages}
                totalRecords={allMembers.length}
                pageSize={membersPageSize}
                onPageChange={setMembersPage}
                onPageSizeChange={setMembersPageSize}
                pageSizeOptions={[4, 8, 16]}
                itemLabel="members"
                className="rounded-xl border"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Alert Integrations */}
        <AlertForm
          initialPreference={preference}
          readOnly={!isOwner}
          className="w-full"
          onSave={async (values) => {
            await updatePreference(values);
          }}
          onTestWebhook={testWebhook}
        />

        {/* 4. Danger Zone (Owner Only) */}
        {isOwner && (
          <Card className="w-full border-rose-500/30 bg-rose-950/10">
            <CardHeader>
              <div>
                <CardTitle className="text-rose-400">
                  <span className="material-symbols-outlined text-rose-400">warning</span>
                  Danger Zone — Delete Project
                </CardTitle>
                <CardDescription>
                  Permanently remove this project from active workspaces.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-[#0d0e13] text-xs text-[#bbcabf] space-y-1">
                <p className="font-semibold text-rose-300">Important about project deletion:</p>
                <p>
                  Deleting this project removes it and its active variables from all team member workspaces.
                  However, <strong>all historical actions and audit trail records will be safely archived</strong> so you can always verify who created, edited, and deleted the project for compliance.
                </p>
              </div>

              {!deleteConfirm ? (
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirm(true)}
                  className="border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 text-xs"
                  icon="delete"
                >
                  Delete This Project
                </Button>
              ) : (
                <div className="space-y-3 p-4 rounded-xl border border-rose-500/30 bg-[#0d0e13]">
                  <div>
                    <label className="block text-xs font-mono text-rose-300 font-semibold mb-1">
                      DELETION NOTE / REASON (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={deletionNote}
                      onChange={(e) => setDeletionNote(e.target.value)}
                      placeholder="e.g. Project finished, Sprint completed, Archived..."
                      className="w-full h-8 px-2.5 bg-[#1a1b21] border border-[#3c4a42] rounded-lg text-xs text-[#e3e1e9] font-mono focus:outline-none focus:border-rose-400"
                    />
                    <p className="text-[10px] text-[#86948a] font-mono mt-1">
                      This note will be permanently recorded in the audit trail for team members to see why the project was closed.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      variant="ghost"
                      onClick={handleDeleteProject}
                      loading={isDeleting}
                      className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold px-4"
                      icon="check"
                    >
                      Yes, Delete Project
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setDeleteConfirm(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
