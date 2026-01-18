import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SourceData } from '../types';
import { generateChartCommentary } from '../api';

interface Props {
    data: SourceData[];
    projectContext: { name: string; type: string; keywords: string[] };
}

export function TopSourcesChart({ data, projectContext }: Props) {
    const [commentary, setCommentary] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data.length > 0) {
            setLoading(true);
            generateChartCommentary('sources', data, projectContext)
                .then(setCommentary)
                .finally(() => setLoading(false));
        }
    }, [data, projectContext]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <span>🏆 Top Sources</span>
                    {loading && <span className="text-yellow-500 animate-pulse">✨</span>}
                </h3>
            </div>
            <div className="px-6 py-4">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="source_name" type="category" width={150} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avg_relevance" fill="#8B5CF6" name="Pertinence" />
                    </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                    {data.slice(0, 5).map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-900">{source.source_name}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500">{source.doc_count} docs</span>
                                <span className="text-xs font-semibold text-purple-600">
                                    {(source.avg_relevance * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {commentary && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-600">✨</span>
                            <p className="text-sm text-gray-700">{commentary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
