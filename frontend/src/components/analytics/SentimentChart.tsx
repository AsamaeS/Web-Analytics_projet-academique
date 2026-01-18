import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SentimentData } from './types';
import { getChartCommentary } from '../../lib/api';

const COLORS = {
    'Positive': '#10B981',
    'Neutral': '#F59E0B',
    'Negative': '#EF4444'
};

interface Props {
    data: SentimentData[];
    projectContext: { id?: string; _id?: string; name: string; type: string; keywords: string[] };
}

export function SentimentChart({ data, projectContext }: Props) {
    const [commentary, setCommentary] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data.length > 0) {
            setLoading(true);
            const projectId = projectContext.id || projectContext._id || '';
            getChartCommentary(projectId, 'sentiment', data, projectContext)
                .then(setCommentary)
                .finally(() => setLoading(false));
        }
    }, [data, projectContext]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <span>😊 Distribution des Sentiments</span>
                    {loading && <span className="text-green-500 animate-pulse">✨</span>}
                </h3>
            </div>
            <div className="px-6 py-4">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.label] || '#9CA3AF'} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                {commentary && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-start gap-2">
                            <span className="text-green-600">✨</span>
                            <p className="text-sm text-gray-700">{commentary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
