# Rapport de Projet : Plateforme Web Analytics Intelligente

**Étudiants :** Anas & Asmae
**Cours :** Web Analytics & Intelligence Artificielle
**Date :** Janvier 2026

## 1. Vue d'ensemble du Projet
Ce projet consiste en une plateforme complète de Web Analytics capable de crawler des sources de données web (HTML, PDF), de stocker les informations dans une base NoSQL et de générer des analyses prédictives et décisionnelles grâce à l'IA.

## 2. Architecture Technique
L'application repose sur une architecture multi-services conteneurisée :
- **Frontend** : React (Vite) + Tailwind CSS + Lucide Icons.
- **Backend API** : Python (FastAPI) pour une gestion asynchrone performante.
- **Worker** : Python (RQ Workers) pour le traitement des tâches de crawling en arrière-plan.
- **Stockage** : 
  - MongoDB (NoSQL) pour la persistance des documents collectés.
  - Redis (Cache) pour la gestion de la file d'attente (Queue) du crawler.
- **IA** : Intégration de l'API Groq (Llama-3/Mixtral) pour le traitement du langage naturel.

## 3. Réalisations Techniques & Intégration IA
Nous avons implémenté et intégré plusieurs modules avancés :
- **Assistant Décisionnel IA (Floating UI)** : Un agent conversationnel capable de répondre à des questions sur les données crawlées et d'aider à la prise de décision.
- **Analyses de Graphiques Contextuelles** : Génération automatique de commentaires pour chaque widget du dashboard (Distribution des sentiments, Mots-clés les plus fréquents, Pertinence des sources).
- **Correctifs de Stabilité** : Résolution des problèmes d'importation circulaires dans le frontend et correction des NameErrors dans le service LLM du backend.

## 4. Stratégie de Déploiement Cloud (Azure)
Le projet est déployé de manière professionnelle sur **Azure App Service for Containers** :
- **Infrastructure** : Utilisation de Docker Compose pour orchestrer les 5 services.
- **Optimisation des Coûts (Student Credits)** :
  - Hébergement des images sur **Docker Hub** (`asmaes/web-analytics_projet-academique`) pour économiser les frais de Container Registry Azure.
  - Utilisation du plan **Basic B1** (Linux) pour un équilibre optimal entre performance et consommation de crédits.
- **Lien du Projet en ligne** : [webintel-asmaes.azurewebsites.net](https://webintel-asmaes-e0e0g6d5d3b9brfv.francecentral-01.azurewebsites.net)

## 5. Guide de démarrage (Local)
Pour lancer le projet localement :
```bash
docker-compose up --build
```
Accès :
- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:8000`

---
*Ce projet démontre une intégration complète entre le Web Crawling, le Cloud Computing et l'Intelligence Artificielle.*
