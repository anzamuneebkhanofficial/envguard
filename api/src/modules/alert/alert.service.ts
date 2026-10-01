import nodemailer from 'nodemailer';
import { alertRepository, type AlertRepository } from './alert.repository.js';
import { authRepository } from '../auth/auth.repository.js';
import { projectRepository } from '../project/project.repository.js';
import type { UpdateAlertPreferenceInput, TestWebhookInput } from './alert.schema.js';
import type { AlertPreferenceDTO, CriticalAlertPayload, AlertPreference } from './alert.types.js';
import { logger } from '../../shared/utils/logger.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../shared/errors/UnauthorizedError.js';

export class AlertService {
  private mailTransporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (this.mailTransporter) return this.mailTransporter;
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.mailTransporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
    return this.mailTransporter;
  }

  constructor(private readonly repo: AlertRepository = alertRepository) {
    this.getTransporter();
  }

  private mapToDTO(item: AlertPreference): AlertPreferenceDTO {
    return {
      id: item._id.toString(),
      userId: item.userId.toString(),
      projectId: item.projectId.toString(),
      notifyOnCriticalChange: item.notifyOnCriticalChange,
      webhookUrl: item.webhookUrl || '',
      emailNotifications: item.emailNotifications,
    };
  }

  async getPreference(userId: string, projectId: string): Promise<AlertPreferenceDTO> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(userId) ||
      project.members.some((m) => String(m.userId) === String(userId));
    if (!isMember) throw new ForbiddenError('Access denied to project alert settings');

    const pref = await this.repo.findByUserAndProject(userId, projectId);
    if (!pref) {
      return {
        id: '',
        userId,
        projectId,
        notifyOnCriticalChange: true,
        webhookUrl: '',
        emailNotifications: false,
      };
    }
    return this.mapToDTO(pref);
  }

  async updatePreference(
    userId: string,
    projectId: string,
    input: UpdateAlertPreferenceInput
  ): Promise<AlertPreferenceDTO> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    if (String(project.ownerId) !== String(userId)) {
      throw new ForbiddenError('Only the project owner can configure alerts and webhooks');
    }

    const updated = await this.repo.upsert(userId, projectId, {
      notifyOnCriticalChange: input.notifyOnCriticalChange,
      webhookUrl: input.webhookUrl || '',
      emailNotifications: input.emailNotifications,
    });
    return this.mapToDTO(updated);
  }

  async sendWebhook(url: string, payload: unknown): Promise<{ success: boolean; status?: number; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EnvGuard-Alert-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `Webhook returned HTTP status ${response.status}`,
        };
      }

      return { success: true, status: response.status };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown webhook network failure';
      logger.warn('Webhook delivery failed', { url, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }

  async sendEmail(toEmail: string, payload: CriticalAlertPayload): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      logger.info('Email alert skipped (SMTP not configured in environment)', { to: toEmail });
      return;
    }

    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: toEmail,
        subject: `[EnvGuard Alert] Critical Variable ${payload.action.toUpperCase()} in ${payload.project}`,
        html: `
          <div style="font-family: monospace; background: #121318; color: #e3e1e9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #ffb95f; margin-top: 0;">EnvGuard Critical Alert</h2>
            <p><strong>Project:</strong> ${payload.project}</p>
            <p><strong>Variable:</strong> <code>${payload.key}</code></p>
            <p><strong>Action:</strong> <span style="text-transform: uppercase;">${payload.action}</span></p>
            <p><strong>Changed By:</strong> ${payload.changedBy}</p>
            <p><strong>Changed At:</strong> ${payload.changedAt}</p>
            <p style="color: #bbcabf; font-size: 12px; margin-top: 24px;">Note: Secret values are never sent in plaintext for audit compliance.</p>
          </div>
        `,
      });
      logger.info('Critical alert email sent successfully', { to: toEmail });
    } catch (err) {
      logger.warn('Failed to send email alert', {
        to: toEmail,
        error: err instanceof Error ? err.message : 'Unknown SMTP failure',
      });
    }
  }

  async triggerCriticalAlert(payload: CriticalAlertPayload, projectId: string): Promise<void> {
    const preferences = await this.repo.listByProject(projectId);

    for (const pref of preferences) {
      if (!pref.notifyOnCriticalChange) continue;

      // 1. Webhook dispatch
      if (pref.webhookUrl) {
        // Fire asynchronously so sync does not block
        this.sendWebhook(pref.webhookUrl, {
          event: 'critical_variable_change',
          ...payload,
        }).catch((err) => {
          logger.warn('Async webhook failed', { error: err });
        });
      }

      // 2. Email dispatch
      if (pref.emailNotifications) {
        authRepository.findById(pref.userId.toString()).then((user) => {
          if (user?.email) {
            this.sendEmail(user.email, payload).catch((err) => {
              logger.warn('Async email alert failed', { error: err });
            });
          }
        });
      }
    }
  }

  async testWebhook(input: TestWebhookInput): Promise<{ message: string; status: number }> {
    const testPayload = {
      event: 'test_webhook',
      project: input.projectId || 'test-project',
      key: 'TEST_SECRET_KEY',
      action: 'updated',
      changedBy: 'system@envguard.local',
      changedAt: new Date().toISOString(),
      note: 'This is a test webhook payload from EnvGuard.',
    };

    const result = await this.sendWebhook(input.webhookUrl, testPayload);
    if (!result.success) {
      throw new AppError(
        `Webhook test failed: ${result.error || 'Server did not return a 2xx response'}`,
        400,
        'WEBHOOK_TEST_FAILED'
      );
    }

    return {
      message: 'Test webhook delivered successfully',
      status: result.status || 200,
    };
  }
}

export const alertService = new AlertService();
