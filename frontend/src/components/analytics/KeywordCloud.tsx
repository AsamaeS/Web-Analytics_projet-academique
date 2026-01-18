import React, { useState, useEffect } from 'react';
import { KeywordData } from './types';
import { getChartCommentary } from '../../lib/api';

interface Props {
    data: KeywordData[];
    projectContext: { id?: string; _id?: string; name: string; type: string; keywords: string[] };
}

export function KeywordCloud({ data, projectContext }: Props) {
    const [commentary, setCommentary] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data.length > 0) {
            setLoading(true);
            const projectId = projectContext.id || projectContext._id || '';
            getChartCommentary(projectId, 'keywords', data, projectContext)
                .then(setCommentary)
                .finally(() => setLoading(false));
        }
    }, [data, projectContext]);

    const maxCount = Math.max(...data.map(k => k.count));
    const getSize = (count: number) => 12 + ((count / maxCount) * 36);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <span>🔤 Top Keywords</span>
                    {loading && <span className="text-purple-500 animate-pulse">✨</span>}
                </h3>
            </div>
            <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2 justify-center items-center min-h-[250px]">
                    {data.map((keyword, idx) => (
                        <span
                            key={idx}
                            className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold hover:scale-110 transition-transform cursor-pointer"
                            style={{ fontSize: `${getSize(keyword.count)}px` }}
                            title={`${keyword.count} occurrences`}
                        >
                            {keyword.keyword}
                        </span>
                    ))}
                </div>

                {commentary && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-start gap-2">
                            <span className="text-purple-600">✨</span>
                            <p className="text-sm text-gray-700">{commentary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
