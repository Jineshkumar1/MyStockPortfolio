"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import WatchlistButton from "@/components/WatchlistButton";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Bell, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { createAlert, deleteAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";

interface WatchlistTableProps {
    items: WatchlistItemWithPrice[];
    selectedItems: string[];
    onSelectItem: (symbol: string) => void;
    onSelectAll: () => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
    onBulkRemove: (symbols: string[]) => void;
    onRemoveItem?: (symbol: string) => void;
    alerts: Record<string, AlertItem[]>;
    onAlertChange: () => void;
}

export default function WatchlistTable({
    items,
    selectedItems,
    onSelectItem,
    onSelectAll,
    sortBy,
    sortOrder,
    onSort,
    onBulkRemove,
    onRemoveItem,
    alerts,
    onAlertChange,
}: WatchlistTableProps) {
    const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);

    const handleSetAlert = async (symbol: string, type: 'upper' | 'lower', currentPrice: number) => {
        setLoadingSymbol(symbol);
        try {
            // Set threshold 5% above/below current price
            const threshold = type === 'upper' 
                ? currentPrice * 1.05 
                : currentPrice * 0.95;
            
            const result = await createAlert(symbol, type, threshold);
            if (result.success) {
                toast.success('Alert set', {
                    description: `${symbol} alert set at $${threshold.toFixed(2)}`
                });
                onAlertChange();
            } else {
                toast.error('Failed to set alert', {
                    description: result.error
                });
            }
        } catch (error) {
            toast.error('Failed to set alert');
        } finally {
            setLoadingSymbol(null);
        }
    };

    const handleRemoveAlert = async (symbol: string, type: 'upper' | 'lower') => {
        setLoadingSymbol(symbol);
        try {
            const result = await deleteAlert(symbol, type);
            if (result.success) {
                toast.success('Alert removed');
                onAlertChange();
            } else {
                toast.error('Failed to remove alert');
            }
        } catch (error) {
            toast.error('Failed to remove alert');
        } finally {
            setLoadingSymbol(null);
        }
    };

    const SortButton = ({ field, label }: { field: string; label: string }) => (
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 hover:text-teal-500 transition-colors"
        >
            {label}
            {sortBy === field ? (
                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            ) : (
                <ArrowUpDown className="w-3 h-3 opacity-50" />
            )}
        </button>
    );

    const formatPrice = (price: number | undefined) => {
        if (price === undefined || price === null) return 'N/A';
        return `$${price.toFixed(2)}`;
    };

    const formatChange = (change: number | undefined, percent: number | undefined) => {
        if (change === undefined || percent === undefined) return null;
        const isPositive = change >= 0;
        return (
            <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
            </span>
        );
    };

    return (
        <div className="watchlist">
            {selectedItems.length > 0 && (
                <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
                    <span className="text-gray-300">
                        {selectedItems.length} stock{selectedItems.length > 1 ? 's' : ''} selected
                    </span>
                    <Button
                        onClick={() => onBulkRemove(selectedItems)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                    >
                        Remove Selected
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="watchlist-table">
                    <thead>
                        <tr className="table-header-row">
                            <th className="table-header py-3 px-4 text-left w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === items.length && items.length > 0}
                                    onChange={onSelectAll}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
                                />
                            </th>
                            <th className="table-header py-3 px-4 text-left">
                                <SortButton field="company" label="Company" />
                            </th>
                            <th className="table-header py-3 px-4 text-left">
                                <SortButton field="symbol" label="Symbol" />
                            </th>
                            <th className="table-header py-3 px-4 text-right">
                                <SortButton field="price" label="Price" />
                            </th>
                            <th className="table-header py-3 px-4 text-right">
                                <SortButton field="change" label="Change" />
                            </th>
                            <th className="table-header py-3 px-4 text-left">
                                <SortButton field="addedAt" label="Added" />
                            </th>
                            <th className="table-header py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const symbolAlerts = alerts[item.symbol] || [];
                            const hasUpperAlert = symbolAlerts.some(a => a.alertType === 'upper' && a.isActive);
                            const hasLowerAlert = symbolAlerts.some(a => a.alertType === 'lower' && a.isActive);
                            const isSelected = selectedItems.includes(item.symbol);
                            const isLoading = loadingSymbol === item.symbol;

                            return (
                                <tr 
                                    key={item.symbol} 
                                    className={`table-row ${isSelected ? 'bg-gray-700/30' : ''}`}
                                >
                                    <td className="table-cell py-4 px-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onSelectItem(item.symbol)}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
                                        />
                                    </td>
                                    <td className="table-cell py-4 px-4">
                                        <Link 
                                            href={`/stocks/${item.symbol}`}
                                            className="hover:text-teal-500 transition-colors font-medium"
                                        >
                                            {item.company}
                                        </Link>
                                    </td>
                                    <td className="table-cell py-4 px-4">
                                        <Link 
                                            href={`/stocks/${item.symbol}`}
                                            className="hover:text-teal-500 transition-colors font-mono font-semibold"
                                        >
                                            {item.symbol}
                                        </Link>
                                    </td>
                                    <td className="table-cell py-4 px-4 text-right font-semibold">
                                        {formatPrice(item.quote?.c)}
                                    </td>
                                    <td className="table-cell py-4 px-4 text-right">
                                        {formatChange(item.quote?.d, item.quote?.dp)}
                                    </td>
                                    <td className="table-cell py-4 px-4 text-gray-400">
                                        {new Date(item.addedAt).toLocaleDateString()}
                                    </td>
                                    <td className="table-cell py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/stocks/${item.symbol}`}
                                                className="text-teal-500 hover:text-teal-400 text-sm font-medium transition-colors"
                                            >
                                                View
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button 
                                                        className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                                                        disabled={isLoading}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                                    {item.quote?.c && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleSetAlert(item.symbol, 'upper', item.quote!.c)}
                                                                disabled={isLoading || hasUpperAlert}
                                                                className="text-gray-300 hover:bg-gray-700"
                                                            >
                                                                <Bell className="w-4 h-4 mr-2" />
                                                                {hasUpperAlert ? 'Upper Alert Set' : 'Set Upper Alert (+5%)'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleSetAlert(item.symbol, 'lower', item.quote!.c)}
                                                                disabled={isLoading || hasLowerAlert}
                                                                className="text-gray-300 hover:bg-gray-700"
                                                            >
                                                                <Bell className="w-4 h-4 mr-2" />
                                                                {hasLowerAlert ? 'Lower Alert Set' : 'Set Lower Alert (-5%)'}
                                                            </DropdownMenuItem>
                                                            {(hasUpperAlert || hasLowerAlert) && (
                                                                <>
                                                                    {hasUpperAlert && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleRemoveAlert(item.symbol, 'upper')}
                                                                            disabled={isLoading}
                                                                            className="text-red-400 hover:bg-gray-700"
                                                                        >
                                                                            Remove Upper Alert
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {hasLowerAlert && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleRemoveAlert(item.symbol, 'lower')}
                                                                            disabled={isLoading}
                                                                            className="text-red-400 hover:bg-gray-700"
                                                                        >
                                                                            Remove Lower Alert
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => onSelectItem(item.symbol)}
                                                        className="text-gray-300 hover:bg-gray-700"
                                                    >
                                                        {isSelected ? 'Deselect' : 'Select'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <WatchlistButton
                                                symbol={item.symbol}
                                                company={item.company}
                                                isInWatchlist={true}
                                                showTrashIcon={true}
                                                type="icon"
                                                onWatchlistChange={(symbol, isAdded) => {
                                                    if (!isAdded && onRemoveItem) {
                                                        onRemoveItem(symbol);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

