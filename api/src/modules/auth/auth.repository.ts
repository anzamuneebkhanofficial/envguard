import mongoose, { Schema, Model } from 'mongoose';
import type { User } from './auth.types.js';

const userMongooseSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>('User', userMongooseSchema);

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return UserModel.findOne({ email: email.toLowerCase().trim() }).lean<User>().exec();
  }

  async findById(id: string): Promise<User | null> {
    return UserModel.findById(id).lean<User>().exec();
  }

  async create(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    const doc = await UserModel.create(data);
    return doc.toObject();
  }
}

export const authRepository = new AuthRepository();
