import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimelineData } from '../types';
import { generateChartCommentary } from '../api';

interface Props {
    data: TimelineData[];
    projectContext: { name: string; type: string; keywords: string[] };
}

export function TimelineChart({ data, projectContext }: Props) {
    const [commentary, setCommentary] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data.length > 0) {
            setLoading(true);
            generateChartCommentary('timeline', data, projectContext)
                .then(setCommentary)
                .finally(() => setLoading(false));
        }
    }, [data, projectContext]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <span>📈 Évolution Temporelle</span>
                    {loading && <span className="text-blue-500 animate-pulse">✨</span>}
                </h3>
            </div>
            <div className="px-6 py-4">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Documents" />
                    </LineChart>
                </ResponsiveContainer>

                {commentary && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600">✨</span>
                            <p className="text-sm text-gray-700">{commentary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
