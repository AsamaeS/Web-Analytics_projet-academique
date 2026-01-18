# Dashboard Intelligence - Standalone

Dashboard intelligent et dynamique avec intégration LLM Groq.

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

1. Copier `.env.example` vers `.env`
2. Ajouter votre clé Groq API

\`\`\`env
VITE_GROQ_API_KEY=gsk_your_key_here
\`\`\`

## Démarrage

\`\`\`bash
npm run dev
\`\`\`

Ouvre automatiquement http://localhost:3000

## Build Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Structure

- `src/App.tsx` - Dashboard principal
- `src/api.ts` - Appels Groq API
- `src/mockData.ts` - Données de test
- `src/components/` - Composants réutilisables
