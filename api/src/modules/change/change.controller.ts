import type { Request, Response } from 'express';
import { changeService, type ChangeService } from './change.service.js';
import type { ListChangesQueryInput } from './change.schema.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';

export class ChangeController {
  constructor(private readonly service: ChangeService = changeService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const query = req.query as unknown as ListChangesQueryInput;
    const result = await this.service.list(
      req.params.projectId as string,
      query,
      req.user
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const change = await this.service.getById(
      req.params.projectId as string,
      req.params.changeId as string,
      req.user
    );
    res.status(200).json({
      success: true,
      data: change,
    });
  };
}

export const changeController = new ChangeController();
