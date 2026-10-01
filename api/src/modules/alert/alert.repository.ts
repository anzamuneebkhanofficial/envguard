import mongoose, { Schema, Types, Model } from 'mongoose';
import type { AlertPreference } from './alert.types.js';

const alertPreferenceMongooseSchema = new Schema<AlertPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    notifyOnCriticalChange: { type: Boolean, default: true },
    webhookUrl: { type: String, trim: true },
    emailNotifications: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for user project alert preferences
alertPreferenceMongooseSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const AlertPreferenceModel: Model<AlertPreference> =
  (mongoose.models.AlertPreference as Model<AlertPreference>) ||
  mongoose.model<AlertPreference>('AlertPreference', alertPreferenceMongooseSchema);

export class AlertRepository {
  async findByUserAndProject(userId: string, projectId: string): Promise<AlertPreference | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(projectId)) return null;
    return AlertPreferenceModel.findOne({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(projectId),
    })
      .lean<AlertPreference>()
      .exec();
  }

  async listByProject(projectId: string): Promise<AlertPreference[]> {
    if (!Types.ObjectId.isValid(projectId)) return [];
    return AlertPreferenceModel.find({ projectId: new Types.ObjectId(projectId) })
      .lean<AlertPreference[]>()
      .exec();
  }

  async upsert(
    userId: string,
    projectId: string,
    data: {
      notifyOnCriticalChange: boolean;
      webhookUrl?: string;
      emailNotifications: boolean;
    }
  ): Promise<AlertPreference> {
    const doc = await AlertPreferenceModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        projectId: new Types.ObjectId(projectId),
      },
      {
        $set: {
          notifyOnCriticalChange: data.notifyOnCriticalChange,
          webhookUrl: data.webhookUrl || '',
          emailNotifications: data.emailNotifications,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .lean<AlertPreference>()
      .exec();

    return doc!;
  }
}

export const alertRepository = new AlertRepository();
