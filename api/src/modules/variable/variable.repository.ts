import mongoose, { Schema, Types, Model } from 'mongoose';
import type { Variable } from './variable.types.js';

const variableMongooseSchema = new Schema<Variable>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true }, // The actual current value
    maskedValue: { type: String }, // Masked value for display
    fingerprint: { type: String }, // Hash fingerprint for diff detection
    isCritical: { type: Boolean, default: false, index: true },
    lastChangedBy: { type: String, required: true },
    lastChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound unique index as required by specification
variableMongooseSchema.index({ projectId: 1, key: 1 }, { unique: true });

export const VariableModel: Model<Variable> =
  (mongoose.models.Variable as Model<Variable>) || mongoose.model<Variable>('Variable', variableMongooseSchema);

export class VariableRepository {
  async listByProject(projectId: string): Promise<Variable[]> {
    if (!Types.ObjectId.isValid(projectId)) return [];
    return VariableModel.find({ projectId: new Types.ObjectId(projectId) })
      .sort({ key: 1 })
      .lean<Variable[]>()
      .exec();
  }

  async listPaginated(
    projectId: string,
    options: { search?: string; page?: number; limit?: number }
  ): Promise<{ variables: Variable[]; total: number }> {
    if (!Types.ObjectId.isValid(projectId)) return { variables: [], total: 0 };
    const query: Record<string, unknown> = {
      projectId: new Types.ObjectId(projectId),
    };

    if (options.search && options.search.trim()) {
      query.key = { $regex: options.search.trim(), $options: 'i' };
    }

    const defaultLimit = parseInt(process.env.VARIABLES_PAGE_LIMIT || '10', 10);
    const limit = options.limit && options.limit > 0 ? options.limit : (isNaN(defaultLimit) ? 10 : defaultLimit);
    const page = options.page && options.page > 0 ? options.page : 1;
    const skip = (page - 1) * limit;

    const [variables, total] = await Promise.all([
      VariableModel.find(query)
        .sort({ key: 1 })
        .skip(skip)
        .limit(limit)
        .lean<Variable[]>()
        .exec(),
      VariableModel.countDocuments(query),
    ]);

    return { variables, total };
  }

  async findByKey(projectId: string, key: string): Promise<Variable | null> {
    if (!Types.ObjectId.isValid(projectId)) return null;
    return VariableModel.findOne({ projectId: new Types.ObjectId(projectId), key })
      .lean<Variable>()
      .exec();
  }

  async upsert(data: {
    projectId: string;
    key: string;
    value: string;
    maskedValue?: string;
    fingerprint: string;
    isCritical: boolean;
    lastChangedBy: string;
    lastChangedAt: Date;
  }): Promise<Variable> {
    const doc = await VariableModel.findOneAndUpdate(
      { projectId: new Types.ObjectId(data.projectId), key: data.key },
      {
        $set: {
          value: data.value,
          maskedValue: data.maskedValue || data.value,
          fingerprint: data.fingerprint,
          isCritical: data.isCritical,
          lastChangedBy: data.lastChangedBy,
          lastChangedAt: data.lastChangedAt,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .lean<Variable>()
      .exec();

    return doc!;
  }

  async deleteByKey(projectId: string, key: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(projectId)) return false;
    const res = await VariableModel.findOneAndDelete({
      projectId: new Types.ObjectId(projectId),
      key,
    }).exec();
    return !!res;
  }
}

export const variableRepository = new VariableRepository();
