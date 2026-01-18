import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        label: string;
    };
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
                        </p>
                    )}
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}
