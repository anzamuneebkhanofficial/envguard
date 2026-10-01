import type { Request, Response } from 'express';
import { projectService, type ProjectService } from './project.service.js';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from './project.schema.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';

export class ProjectController {
  constructor(private readonly service: ProjectService = projectService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as CreateProjectInput;
    const project = await this.service.create(req.user.userId, input);
    res.status(201).json({
      success: true,
      data: project,
    });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };

    if (page !== undefined || limit !== undefined || search !== undefined) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 8;
      const result = await this.service.listPaginated(req.user.userId, {
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

    const projects = await this.service.list(req.user.userId);
    res.status(200).json({
      success: true,
      data: projects,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const project = await this.service.getById(req.params.id as string, req.user.userId);
    res.status(200).json({
      success: true,
      data: project,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as UpdateProjectInput;
    const project = await this.service.update(req.params.id as string, req.user.userId, input);
    res.status(200).json({
      success: true,
      data: project,
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const note = (req.body?.note || req.body?.reason || '') as string;
    await this.service.delete(req.params.id as string, req.user.userId, note);
    res.status(200).json({
      success: true,
      data: { message: 'Project deleted successfully' },
    });
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as AddMemberInput;
    const project = await this.service.addMember(req.params.id as string, req.user.userId, input);
    res.status(200).json({
      success: true,
      data: project,
    });
  };

  removeMember = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const project = await this.service.removeMember(
      req.params.id as string,
      req.user.userId,
      req.params.userId as string
    );
    res.status(200).json({
      success: true,
      data: project,
    });
  };
}

export const projectController = new ProjectController();
