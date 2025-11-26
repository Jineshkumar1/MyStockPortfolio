import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface RateLimitDocument extends Document {
    userId: string;
    modelName: string;
    requests: Array<{
        timestamp: Date;
    }>;
    dailyCount: number;
    dailyResetAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RateLimitSchema = new Schema<RateLimitDocument>(
    {
        userId: { type: String, required: true, index: true },
        modelName: { type: String, required: true, index: true },
        requests: [{
            timestamp: { type: Date, required: true }
        }],
        dailyCount: { type: Number, default: 0 },
        dailyResetAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Compound index for efficient queries
RateLimitSchema.index({ userId: 1, modelName: 1 }, { unique: true });

// Auto-cleanup old requests (older than 1 minute)
RateLimitSchema.pre('save', function() {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    this.requests = this.requests.filter(req => req.timestamp > oneMinuteAgo);
});

export const RateLimit: Model<RateLimitDocument> =
    (models?.RateLimit as Model<RateLimitDocument>) || 
    model<RateLimitDocument>('RateLimit', RateLimitSchema);

