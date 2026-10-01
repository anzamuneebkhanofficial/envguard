import type { Request, Response } from 'express';
import { variableService, type VariableService } from './variable.service.js';
import type { SyncVariablesInput, UpdateVariableInput } from './variable.schema.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';

export class VariableController {
  constructor(private readonly service: VariableService = variableService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };
    
    // If page, limit, or search query parameters are provided, return paginated envelope
    if (page !== undefined || limit !== undefined || search !== undefined) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 8;
      const result = await this.service.listPaginated(req.params.projectId as string, req.user, {
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 8 : limitNum,
        search,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    }

    const variables = await this.service.list(req.params.projectId as string, req.user);
    res.status(200).json({
      success: true,
      data: variables,
    });
  };

  sync = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as SyncVariablesInput;
    const diff = await this.service.sync(req.params.projectId as string, req.user, input);
    res.status(200).json({
      success: true,
      data: diff,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as UpdateVariableInput;
    const updated = await this.service.update(
      req.params.projectId as string,
      req.params.key as string,
      req.user,
      input
    );
    res.status(200).json({
      success: true,
      data: updated,
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    await this.service.delete(
      req.params.projectId as string,
      req.params.key as string,
      req.user
    );
    res.status(200).json({
      success: true,
      data: { message: `Variable ${req.params.key} deleted successfully` },
    });
  };

  getEnvExample = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const content = await this.service.getEnvExample(req.params.projectId as string, req.user);
    res.status(200).json({
      success: true,
      data: { content },
    });
  };

  exportEnv = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const content = await this.service.exportEnv(req.params.projectId as string, req.user);
    res.status(200).json({
      success: true,
      data: { content },
    });
  };

  exportExample = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const content = await this.service.exportExample(req.params.projectId as string, req.user);
    res.status(200).json({
      success: true,
      data: { content },
    });
  };
}

export const variableController = new VariableController();
