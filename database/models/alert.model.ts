import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface AlertItem extends Document {
    userId: string;
    symbol: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    isActive: boolean;
    createdAt: Date;
    triggeredAt?: Date;
}

const AlertSchema = new Schema<AlertItem>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        alertType: { type: String, required: true, enum: ['upper', 'lower'] },
        threshold: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        triggeredAt: { type: Date },
    },
    { timestamps: false }
);

// Prevent duplicate alerts per user/symbol/type
AlertSchema.index({ userId: 1, symbol: 1, alertType: 1 }, { unique: true });

export const Alert: Model<AlertItem> =
    (models?.Alert as Model<AlertItem>) || model<AlertItem>('Alert', AlertSchema);

