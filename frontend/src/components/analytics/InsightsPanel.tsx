import React from 'react';
import { Insights } from './types';

interface Props {
    insights: Insights;
}

export function InsightsPanel({ insights }: Props) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md border border-blue-200">
            <div className="px-6 py-4 border-b border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <span>✨</span>
                    Insights Clés Générés par IA
                </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
                {insights.summary && (
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-700">{insights.summary}</p>
                    </div>
                )}

                <ul className="space-y-3">
                    {insights.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                            <span className="text-yellow-500 text-lg">💡</span>
                            <span className="text-sm text-gray-700">{insight}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
