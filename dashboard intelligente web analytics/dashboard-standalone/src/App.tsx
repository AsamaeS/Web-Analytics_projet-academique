import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardData } from './types';
import { MetricCard } from './components/MetricCard';
import { TimelineChart } from './components/TimelineChart';
import { SentimentChart } from './components/SentimentChart';
import { KeywordCloud } from './components/KeywordCloud';
import { TopSourcesChart } from './components/TopSourcesChart';
import { InsightsPanel } from './components/InsightsPanel';
import { ChatAssistant } from './components/ChatAssistant';
import { generateInsights } from './api';

// Configuration API Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
    const [projectId, setProjectId] = useState('');
    const [dateRange, setDateRange] = useState(30);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    // Charge liste des projets au démarrage
    useEffect(() => {
        loadProjects();
    }, []);

    // Charge données du projet quand projectId change
    useEffect(() => {
        if (projectId) {
            loadDashboardData(projectId, dateRange);
        }
    }, [projectId, dateRange]);

    async function loadProjects() {
        try {
            const response = await axios.get(`${API_URL}/api/projects`);
            setProjects(response.data.projects || []);
            // Sélectionne premier projet par défaut
            if (response.data.projects?.length > 0) {
                setProjectId(response.data.projects[0]._id || response.data.projects[0].id);
            }
        } catch (err) {
            console.error('Error loading projects:', err);
            setError('Impossible de charger les projets. Vérifiez que le backend est démarré.');
        }
    }

    async function loadDashboardData(pid: string, days: number) {
        setLoading(true);
        setError(null);

        try {
            // Charge toutes les données en parallèle
            const [overview, timeline, sentiment, keywords, sources] = await Promise.all([
                axios.get(`${API_URL}/api/dashboard/projects/${pid}/overview`),
                axios.get(`${API_URL}/api/dashboard/projects/${pid}/timeline?days=${days}`),
                axios.get(`${API_URL}/api/dashboard/projects/${pid}/sentiment`),
                axios.get(`${API_URL}/api/dashboard/projects/${pid}/keywords?limit=20`),
                axios.get(`${API_URL}/api/dashboard/projects/${pid}/top-sources?limit=10`)
            ]);

            const projectData = overview.data;

            // Génère insights via Groq
            const insights = await generateInsights(
                projectData.project.name,
                projectData.project.type,
                projectData.project.keywords,
                projectData.stats.total_documents
            );

            setData({
                project: projectData.project,
                stats: projectData.stats,
                timeline: timeline.data.data || [],
                sentiment: sentiment.data.data || [],
                keywords: keywords.data.data || [],
                sources: sources.data.data || [],
                insights
            });

        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }

    // Loading state
    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 max-w-md">
                    <h3 className="text-red-600 font-semibold mb-2">❌ Erreur</h3>
                    <p className="text-gray-700">{error}</p>
                    <p className="text-sm text-gray-500 mt-4">
                        Assurez-vous que le backend est démarré sur {API_URL}
                    </p>
                    <button
                        onClick={() => loadProjects()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // No project selected
    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md border p-6 max-w-md">
                    <h3 className="text-gray-900 font-semibold mb-4">Sélectionnez un projet</h3>
                    {projects.length > 0 ? (
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded"
                        >
                            <option value="">-- Choisir --</option>
                            {projects.map((p) => (
                                <option key={p._id || p.id} value={p._id || p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-gray-500">Aucun projet disponible</p>
                    )}
                </div>
            </div>
        );
    }

    const projectContext = {
        name: data.project.name,
        type: data.project.type,
        keywords: data.project.keywords
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{data.project.name}</h1>
                        <p className="text-gray-500 mt-1">
                            Type : <span className="font-semibold capitalize">{data.project.type.replace('_', ' ')}</span> •
                            Keywords : {data.project.keywords.join(', ')}
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Sélecteur projet */}
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded bg-white"
                        >
                            {projects.map((p) => (
                                <option key={p._id || p.id} value={p._id || p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        {/* Sélecteur période */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded bg-white"
                        >
                            <option value={7}>7 derniers jours</option>
                            <option value={30}>30 derniers jours</option>
                            <option value={90}>90 derniers jours</option>
                            <option value={365}>1 an</option>
                        </select>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Documents Collectés"
                        value={data.stats.total_documents}
                        icon="📄"
                    />
                    <MetricCard
                        title="Sources Actives"
                        value={data.stats.total_sources}
                        icon="🔗"
                    />
                    <MetricCard
                        title="Sentiment Moyen"
                        value={`${(data.stats.avg_sentiment * 100).toFixed(0)}%`}
                        icon="😊"
                    />
                    <MetricCard
                        title="Dernier Crawl"
                        value={data.stats.last_crawl ? new Date(data.stats.last_crawl).toLocaleDateString('fr-FR') : 'N/A'}
                        icon="🕐"
                    />
                </div>

                {/* Insights Panel */}
                <InsightsPanel insights={data.insights} />

                {/* Graphiques - Layout adaptatif selon type projet */}
                {data.project.type === 'investment' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TimelineChart data={data.timeline} projectContext={projectContext} />
                            <SentimentChart data={data.sentiment} projectContext={projectContext} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <KeywordCloud data={data.keywords} projectContext={projectContext} />
                            <TopSourcesChart data={data.sources} projectContext={projectContext} />
                        </div>
                    </div>
                )}

                {data.project.type === 'market_research' && (
                    <div className="space-y-6">
                        <KeywordCloud data={data.keywords} projectContext={projectContext} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TimelineChart data={data.timeline} projectContext={projectContext} />
                            <TopSourcesChart data={data.sources} projectContext={projectContext} />
                        </div>
                        <SentimentChart data={data.sentiment} projectContext={projectContext} />
                    </div>
                )}

                {data.project.type === 'strategic_watch' && (
                    <div className="space-y-6">
                        <TimelineChart data={data.timeline} projectContext={projectContext} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <KeywordCloud data={data.keywords} projectContext={projectContext} />
                            <SentimentChart data={data.sentiment} projectContext={projectContext} />
                            <TopSourcesChart data={data.sources} projectContext={projectContext} />
                        </div>
                    </div>
                )}

                {/* Layout générique pour autres types */}
                {!['investment', 'market_research', 'strategic_watch'].includes(data.project.type) && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TimelineChart data={data.timeline} projectContext={projectContext} />
                            <SentimentChart data={data.sentiment} projectContext={projectContext} />
                            <KeywordCloud data={data.keywords} projectContext={projectContext} />
                            <TopSourcesChart data={data.sources} projectContext={projectContext} />
                        </div>
                    </div>
                )}

                {/* Loading overlay pendant refresh */}
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-xl">
                            <div className="spinner mx-auto mb-2"></div>
                            <p className="text-gray-600">Actualisation...</p>
                        </div>
                    </div>
                )}

                {/* Assistant Chat Flottant */}
                <ChatAssistant projectContext={data} />
            </div>
        </div>
    );
}

export default App;
