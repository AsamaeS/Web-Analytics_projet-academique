"""
Named Entity Recognition Service using spaCy.
"""
import spacy
from typing import List, Dict, Any

class NERExtractor:
    """
    Extracts entities (ORG, PERSON, LOC, etc) from text.
    """
    
    def __init__(self):
        # Load models lazily or on init? 
        # On init might be slow for worker startup, but better for processing.
        try:
            self.nlp_fr = spacy.load("fr_core_news_sm")
            self.nlp_en = spacy.load("en_core_web_sm")
        except OSError:
            print("[Warning] Spacy models not found. Please run: python -m spacy download fr_core_news_sm")
            self.nlp_fr = None
            self.nlp_en = None
            
    def extract(self, text: str, language: str = "fr") -> List[Dict[str, Any]]:
        """
        Extract entities.
        """
        nlp = self.nlp_fr if language == "fr" else self.nlp_en
        
        if not nlp or not text:
            return []
            
        # Limit text length
        doc = nlp(text[:100000]) # 100k char limit
        
        entities = {}
        target_labels = ["ORG", "GPE", "LOC", "PERSON", "MONEY", "PRODUCT"]
        
        for ent in doc.ents:
            if ent.label_ in target_labels:
                key = (ent.text, ent.label_)
                entities[key] = entities.get(key, 0) + 1
                
        # Format output
        results = []
        for (text, label), count in entities.items():
            results.append({
                "text": text,
                "type": label,
                "count": count
            })
            
        # Sort by count desc
        return sorted(results, key=lambda x: x["count"], reverse=True)[:20]
