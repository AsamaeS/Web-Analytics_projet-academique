import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

let groqClient: Groq | null = null;

if (GROQ_API_KEY) {
    groqClient = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true // Pour standalone dev
    });
}

export async function generateChartCommentary(
    chartType: string,
    data: any,
    projectContext: { name: string; type: string; keywords: string[] }
): Promise<string> {
    if (!groqClient) {
        return "⚠️ Clé API Groq non configurée. Ajoutez VITE_GROQ_API_KEY dans .env";
    }

    const prompts: Record<string, string> = {
        timeline: `Analyse ce graphique d'évolution temporelle : ${JSON.stringify(data)}
    
Identifie :
- Tendance générale (hausse/baisse/stable)
- Pics ou creux notables
- Périodes d'activité intense

Réponds en 2-3 phrases courtes et actionnables pour le projet "${projectContext.name}".`,

        sentiment: `Analyse cette distribution de sentiments : ${JSON.stringify(data)}

Pour le projet "${projectContext.name}" (${projectContext.type}), analyse :
- Sentiment dominant
- Équilibre positif/négatif
- Implications stratégiques

Réponds en 2-3 phrases.`,

        keywords: `Analyse ces top keywords : ${JSON.stringify(data)}

Pour le projet "${projectContext.name}", identifie :
- Thématiques dominantes
- Mots-clés inattendus
- Cohérence avec objectifs : ${projectContext.keywords.join(', ')}

Réponds en 2-3 phrases.`,

        sources: `Analyse ce classement de sources : ${JSON.stringify(data)}

Pour le projet "${projectContext.name}", analyse :
- Sources les plus pertinentes
- Qualité globale
- Recommandations

Réponds en 2-3 phrases.`
    };

    try {
        const completion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un analyste expert en aide à la décision. Réponds de manière concise et actionnable.'
                },
                {
                    role: 'user',
                    content: prompts[chartType] || 'Analyse ces données.'
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.4,
            max_tokens: 200,
        });

        return completion.choices[0]?.message?.content || 'Commentaire indisponible';
    } catch (error) {
        console.error('Groq API Error:', error);
        return `❌ Erreur lors de la génération du commentaire`;
    }
}

export async function generateInsights(
    projectName: string,
    projectType: string,
    keywords: string[],
    documentsCount: number
): Promise<{ insights: string[]; summary: string }> {
    if (!groqClient) {
        return {
            insights: ['⚠️ Configuration Groq API manquante'],
            summary: 'Ajoutez votre clé API Groq dans .env pour activer les insights IA.'
        };
    }

    try {
        const completion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Tu es analyste expert pour le projet "${projectName}" (type: ${projectType}).`
                },
                {
                    role: 'user',
                    content: `Génère 5 insights clés sur un projet ${projectType} analysant ${documentsCount} documents avec ces keywords: ${keywords.join(', ')}.

Format : liste de 5 bullets courts (max 20 mots chacun) avec emojis pertinents.
Exemple : "📈 Croissance de 15% détectée dans le secteur"

Réponds UNIQUEMENT avec les 5 bullets, rien d'autre.`
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 300,
        });

        const response = completion.choices[0]?.message?.content || '';
        const insights = response
            .split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().match(/^[0-9]/))
            .map(line => line.replace(/^[-0-9.\s]+/, '').trim())
            .filter(Boolean)
            .slice(0, 5);

        // Génère résumé
        const summaryCompletion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `En 2 phrases max, résume l'état du projet ${projectName} basé sur ${documentsCount} documents analysés.`
                }
            ],
            model: 'llama-3.1-8b-instant',
            max_tokens: 150,
        });

        const summary = summaryCompletion.choices[0]?.message?.content || '';

        return { insights, summary };
    } catch (error) {
        console.error('Insights generation error:', error);
        return {
            insights: ['❌ Erreur lors de la génération'],
            summary: ''
        };
    }
}

export async function chatWithData(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    projectContext: any
): Promise<string> {
    if (!groqClient) return "⚠️ API non configurée";

    const dataContext = JSON.stringify(projectContext);

    try {
        const completion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Tu es un Expert Data Analyst et consultant Power BI chevronné.
          Ton but est d'aider le décideur à interpréter ces données : ${dataContext}.
          
          Adopte une posture de conseil stratégique :
          1. Analyse les tendances comme un expert BI.
          2. Fais des recommandations proactives pour la prise de décision.
          3. Suggère des actions concrètes.
          
          Réponds en Markdown de façon professionnelle et structurée.`
                },
                ...history,
                { role: 'user', content: message }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
        });

        return completion.choices[0]?.message?.content || "Pas de réponse.";
    } catch (error) {
        return "❌ Erreur de communication avec l'IA.";
    }
}
