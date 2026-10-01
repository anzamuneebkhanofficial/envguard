import jwt from 'jsonwebtoken';
import { authRepository, type AuthRepository } from './auth.repository.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import type { AuthTokens, UserSafeProfile } from './auth.types.js';
import { hashPassword, comparePassword } from '../../shared/utils/hash.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { env } from '../../config/env.js';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  private generateToken(payload: { userId: string; email: string; name: string }): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ValidationError('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const createdUser = await this.repo.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    const safeUser: UserSafeProfile = {
      id: createdUser._id.toString(),
      email: createdUser.email,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };

    const token = this.generateToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
    });

    return { token, user: safeUser };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const safeUser: UserSafeProfile = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = this.generateToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
    });

    return { token, user: safeUser };
  }

  async getMe(userId: string): Promise<UserSafeProfile> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
