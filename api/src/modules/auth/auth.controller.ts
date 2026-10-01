import type { Request, Response } from 'express';
import { authService, type AuthService } from './auth.service.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as RegisterInput;
    const result = await this.service.register(input);
    res.status(201).json({
      success: true,
      data: result,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as LoginInput;
    const result = await this.service.login(input);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication context missing');
    }
    const profile = await this.service.getMe(req.user.userId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  };
}

export const authController = new AuthController();
