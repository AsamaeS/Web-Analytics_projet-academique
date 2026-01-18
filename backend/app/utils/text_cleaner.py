"""
Text cleaning and normalization utilities.
"""
import re
import unicodedata
from bs4 import BeautifulSoup


def clean_html(html: str) -> str:
    """Remove HTML tags and get clean text"""
    soup = BeautifulSoup(html, 'lxml')
    
    # Remove script and style elements
    for script in soup(['script', 'style', 'noscript']):
        script.decompose()
    
    # Get text
    text = soup.get_text(separator=' ')
    
    return clean_text(text)


def clean_text(text: str) -> str:
    """Clean and normalize text"""
    
    # Normalize unicode
    text = unicodedata.normalize('NFKC', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text


def truncate_text(text: str, max_length: int = 5000) -> str:
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."


def extract_domain(url: str) -> str:
    """Extract domain name from URL"""
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return parsed.netloc
