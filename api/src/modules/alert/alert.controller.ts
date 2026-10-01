import type { Request, Response } from 'express';
import { alertService, type AlertService } from './alert.service.js';
import type { UpdateAlertPreferenceInput, TestWebhookInput } from './alert.schema.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';

export class AlertController {
  constructor(private readonly service: AlertService = alertService) {}

  getPreference = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const pref = await this.service.getPreference(
      req.user.userId,
      req.params.projectId as string
    );
    res.status(200).json({
      success: true,
      data: pref,
    });
  };

  updatePreference = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as UpdateAlertPreferenceInput;
    const updated = await this.service.updatePreference(
      req.user.userId,
      req.params.projectId as string,
      input
    );
    res.status(200).json({
      success: true,
      data: updated,
    });
  };

  testWebhook = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as TestWebhookInput;
    const result = await this.service.testWebhook(input);
    res.status(200).json({
      success: true,
      data: result,
    });
  };
}

export const alertController = new AlertController();
