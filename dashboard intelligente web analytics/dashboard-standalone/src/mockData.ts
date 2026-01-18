import { DashboardData } from './types';

export const mockDashboardData: DashboardData = {
    project: {
        id: '1',
        name: 'Investissement Secteur Hospitalier',
        type: 'investment',
        keywords: ['hôpital', 'budget', 'santé', 'investissement']
    },
    stats: {
        total_documents: 1847,
        total_sources: 12,
        avg_sentiment: 0.65,
        last_crawl: '2025-01-17T10:30:00Z'
    },
    timeline: [
        { date: '2025-01-10', count: 45 },
        { date: '2025-01-11', count: 67 },
        { date: '2025-01-12', count: 89 },
        { date: '2025-01-13', count: 56 },
        { date: '2025-01-14', count: 123 },
        { date: '2025-01-15', count: 98 },
        { date: '2025-01-16', count: 145 },
        { date: '2025-01-17', count: 167 },
    ],
    sentiment: [
        { label: 'Positive', value: 450, percentage: 45 },
        { label: 'Neutral', value: 350, percentage: 35 },
        { label: 'Negative', value: 200, percentage: 20 }
    ],
    keywords: [
        { keyword: 'hôpital', count: 245 },
        { keyword: 'budget', count: 189 },
        { keyword: 'santé', count: 167 },
        { keyword: 'investissement', count: 145 },
        { keyword: 'financement', count: 123 },
        { keyword: 'infrastructure', count: 98 },
        { keyword: 'équipement', count: 87 },
        { keyword: 'personnel', count: 76 },
        { keyword: 'capacité', count: 65 },
        { keyword: 'restructuration', count: 54 },
    ],
    sources: [
        { source_name: 'WHO Website', doc_count: 156, avg_relevance: 0.87 },
        { source_name: 'Ministère Santé', doc_count: 134, avg_relevance: 0.82 },
        { source_name: 'Le Figaro Santé', doc_count: 98, avg_relevance: 0.78 },
        { source_name: 'Reuters Health', doc_count: 87, avg_relevance: 0.75 },
        { source_name: 'France Info', doc_count: 76, avg_relevance: 0.71 },
    ],
    insights: {
        summary: "D'après l'analyse des 1847 documents collectés, le secteur hospitalier montre des signaux positifs pour l'investissement avec une croissance budgétaire confirmée de +15% en 2025.",
        insights: [
            '📈 Forte croissance du budget santé détectée (+15% en 2025)',
            '⚠️ Mentions négatives sur "restructuration hospitalière" en hausse de 12%',
            '💡 Secteur privé capte 23% du marché avec tendance haussière',
            '🎯 Opportunité identifiée en Île-de-France selon 12 sources convergentes',
            '📊 Sentiment globalement positif (68%) sur investissements hospitaliers',
        ]
    }
};

// Données alternatives pour Market Research
export const mockMarketResearchData: DashboardData = {
    project: {
        id: '2',
        name: 'Étude Marché Énergies Renouvelables',
        type: 'market_research',
        keywords: ['éolien', 'solaire', 'énergie', 'transition']
    },
    stats: {
        total_documents: 2341,
        total_sources: 18,
        avg_sentiment: 0.72,
        last_crawl: '2025-01-17T14:20:00Z'
    },
    timeline: [
        { date: '2025-01-10', count: 78 },
        { date: '2025-01-11', count: 92 },
        { date: '2025-01-12', count: 134 },
        { date: '2025-01-13', count: 98 },
        { date: '2025-01-14', count: 156 },
        { date: '2025-01-15', count: 187 },
        { date: '2025-01-16', count: 201 },
        { date: '2025-01-17', count: 234 },
    ],
    sentiment: [
        { label: 'Positive', value: 720, percentage: 58 },
        { label: 'Neutral', value: 390, percentage: 31 },
        { label: 'Negative', value: 140, percentage: 11 }
    ],
    keywords: [
        { keyword: 'solaire', count: 456 },
        { keyword: 'éolien', count: 389 },
        { keyword: 'transition', count: 312 },
        { keyword: 'renouvelable', count: 298 },
        { keyword: 'photovoltaïque', count: 234 },
        { keyword: 'hydrogène', count: 198 },
        { keyword: 'stockage', count: 176 },
        { keyword: 'batterie', count: 145 },
    ],
    sources: [
        { source_name: 'IEA Reports', doc_count: 234, avg_relevance: 0.91 },
        { source_name: 'RTE France', doc_count: 198, avg_relevance: 0.88 },
        { source_name: 'ADEME', doc_count: 176, avg_relevance: 0.85 },
        { source_name: 'Les Echos Energie', doc_count: 145, avg_relevance: 0.79 },
    ],
    insights: {
        summary: "Le marché des énergies renouvelables affiche une dynamique exceptionnelle avec une croissance de 28% du secteur solaire et des investissements massifs dans le stockage.",
        insights: [
            '☀️ Explosion du marché solaire photovoltaïque (+28% en 1 an)',
            '💨 L\'éolien offshore gagne en attractivité (15 projets annoncés)',
            '🔋 Investissements batteries de stockage en forte hausse',
            '🌍 Objectifs neutralité carbone 2050 accélèrent la transition',
            '💰 Coûts de production en baisse constante (-12% pour le solaire)',
        ]
    }
};
