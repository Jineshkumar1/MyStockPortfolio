'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
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

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

export async function getWatchlistItems(): Promise<WatchlistItem[]> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return [];

        const mongoose = await connectToDatabase();
        const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
        return items.map((item) => ({
            userId: String(item.userId),
            symbol: String(item.symbol),
            company: String(item.company),
            addedAt: item.addedAt,
        }));
    } catch (err) {
        console.error('getWatchlistItems error:', err);
        return [];
    }
}

export async function addToWatchlist(symbol: string, company: string): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const mongoose = await connectToDatabase();
        
        // Check if already exists
        const existing = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() });
        if (existing) {
            return { success: true }; // Already in watchlist
        }

        await Watchlist.create({
            userId,
            symbol: symbol.toUpperCase(),
            company: company || symbol,
            addedAt: new Date(),
        });

        return { success: true };
    } catch (err: any) {
        console.error('addToWatchlist error:', err);
        return { success: false, error: err.message || 'Failed to add to watchlist' };
    }
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const mongoose = await connectToDatabase();
        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });

        return { success: true };
    } catch (err: any) {
        console.error('removeFromWatchlist error:', err);
        return { success: false, error: err.message || 'Failed to remove from watchlist' };
    }
}

export async function toggleWatchlist(symbol: string, company: string, isInWatchlist: boolean): Promise<{ success: boolean; error?: string }> {
    if (isInWatchlist) {
        return await removeFromWatchlist(symbol);
    } else {
        return await addToWatchlist(symbol, company);
    }
}

export async function removeBulkFromWatchlist(symbols: string[]): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const mongoose = await connectToDatabase();
        const result = await Watchlist.deleteMany({ 
            userId, 
            symbol: { $in: symbols.map(s => s.toUpperCase()) } 
        });

        return { success: true, count: result.deletedCount || 0 };
    } catch (err: any) {
        console.error('removeBulkFromWatchlist error:', err);
        return { success: false, error: err.message || 'Failed to remove stocks' };
    }
}