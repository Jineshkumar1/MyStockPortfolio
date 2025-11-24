'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

async function getCurrentUserId(): Promise<string | null> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        return session?.user?.id || null;
    } catch (err) {
        console.error('getCurrentUserId error:', err);
        return null;
    }
}

export async function getAlertsForSymbols(symbols: string[]): Promise<Record<string, AlertItem[]>> {
    try {
        const userId = await getCurrentUserId();
        if (!userId || symbols.length === 0) return {};

        const mongoose = await connectToDatabase();
        const alerts = await Alert.find({ 
            userId, 
            symbol: { $in: symbols.map(s => s.toUpperCase()) },
            isActive: true 
        }).lean();

        const alertsBySymbol: Record<string, AlertItem[]> = {};
        alerts.forEach((alert) => {
            const symbol = String(alert.symbol).toUpperCase();
            if (!alertsBySymbol[symbol]) {
                alertsBySymbol[symbol] = [];
            }
            alertsBySymbol[symbol].push({
                userId: String(alert.userId),
                symbol: String(alert.symbol),
                alertType: alert.alertType as 'upper' | 'lower',
                threshold: Number(alert.threshold),
                isActive: Boolean(alert.isActive),
                createdAt: alert.createdAt,
                triggeredAt: alert.triggeredAt ? alert.triggeredAt : undefined,
            });
        });

        return alertsBySymbol;
    } catch (err) {
        console.error('getAlertsForSymbols error:', err);
        return {};
    }
}

export async function createAlert(
    symbol: string,
    alertType: 'upper' | 'lower',
    threshold: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const mongoose = await connectToDatabase();
        
        // Check if alert already exists
        const existing = await Alert.findOne({ 
            userId, 
            symbol: symbol.toUpperCase(), 
            alertType 
        });
        
        if (existing) {
            // Update existing alert
            await Alert.updateOne(
                { _id: existing._id },
                { threshold, isActive: true, triggeredAt: null }
            );
        } else {
            // Create new alert
            await Alert.create({
                userId,
                symbol: symbol.toUpperCase(),
                alertType,
                threshold,
                isActive: true,
            });
        }

        return { success: true };
    } catch (err: any) {
        console.error('createAlert error:', err);
        return { success: false, error: err.message || 'Failed to create alert' };
    }
}

export async function deleteAlert(symbol: string, alertType: 'upper' | 'lower'): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const mongoose = await connectToDatabase();
        await Alert.deleteOne({ 
            userId, 
            symbol: symbol.toUpperCase(), 
            alertType 
        });

        return { success: true };
    } catch (err: any) {
        console.error('deleteAlert error:', err);
        return { success: false, error: err.message || 'Failed to delete alert' };
    }
}


