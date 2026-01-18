"""
Sentiment Analyzer Service using VADER.
"""
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict, Any

class SentimentAnalyzer:
    """
    Analyzes text sentiment.
    """
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Return compound score, label, and confidence.
        """
        if not text:
            return {"score": 0.0, "label": "neutral", "confidence": 0.0}
            
        # VADER works best on sentences, but we'll try chunking or full text?
        # For long text, maybe average of chunks?
        # Simple approach for now:
        # Truncate to first 5000 chars to avoid performance issues
        sample = text[:5000]
        
        scores = self.analyzer.polarity_scores(sample)
        compound = scores['compound']
        
        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"
            
        return {
            "score": compound,
            "label": label,
            "confidence": abs(compound)
        }
