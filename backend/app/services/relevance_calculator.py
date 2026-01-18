"""
Relevance Calculator Service.
"""
from typing import List

class RelevanceCalculator:
    """
    Calculates relevance of a document to the project.
    """
    
    def calculate(self, content_text: str, project_keywords: List[str]) -> float:
        """
        Keyword density scoring with fuzzy phrase support.
        """
        if not content_text or not project_keywords:
            return 0.0
            
        text_lower = content_text.lower()
        matches = 0.0
        
        for kw in project_keywords:
            kw_clean = kw.lower().strip()
            if not kw_clean:
                continue
                
            # 1. Exact phrase match (Full weight)
            exact_count = text_lower.count(kw_clean)
            if exact_count > 0:
                matches += exact_count
            else:
                # 2. Fuzzy match for multi-word keywords (Partial weight)
                # Helps with typos like "offshore wind far" vs "offshore wind farm"
                kw_words = [w for w in kw_clean.split() if len(w) > 2]
                if len(kw_words) > 1:
                    # Count how many words of the phrase exist
                    words_present = sum(1 for w in kw_words if w in text_lower)
                    if words_present >= len(kw_words) - 1: # 80%+ of words present
                        # Add a fractional match
                        matches += 0.5
            
        # Score = (Total Matches / (Word Count / 100))
        # This gives higher score to denser content.
        # Target density: 0.5% (5 matches per 1000 words) = 1.0 (Full Relevance)
        
        words = len(text_lower.split())
        if words < 10: # Too short to be relevant
            return 0.0
            
        density = matches / words
        score = density / 0.005 
        
        return round(min(score, 1.0), 3)
