"""
Content Parser Service.
Extracts clean content and metadata from HTML.
"""
from bs4 import BeautifulSoup
from typing import Dict, Any, List
from app.utils.text_cleaner import clean_text
import dateutil.parser

class ContentParser:
    """
    Parses HTML content to extract title, body, date, author, etc.
    """
    
    def extract_content(self, html: str, base_url: str = "", selectors: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Extract content using heuristic or custom selectors.
        """
        soup = BeautifulSoup(html, 'lxml')
        selectors = selectors or {}
        
        # 1. Title
        title = self._extract_title(soup, selectors.get('title'))
        
        # 2. Content
        content_html, content_text = self._extract_body(soup, selectors.get('content'))
        
        # 3. Metadata
        links = self._extract_links(soup, base_url)
        metadata = {
            "author": self._extract_author(soup, selectors.get('author')),
            "publish_date": self._extract_date(soup, selectors.get('date')),
            "word_count": len(content_text.split()),
            "images": self._extract_images(soup),
            "internal_links": links["internal"],
            "outbound_links": links["external"]
        }
        
        return {
            "title": title,
            "content": content_text,
            "content_html": str(content_html) if content_html else "",
            "word_count": metadata["word_count"],
            "metadata": metadata
        }
    
    def _extract_title(self, soup, selector=None):
        if selector and soup.select_one(selector):
            return clean_text(soup.select_one(selector).text)
        
        if soup.title:
            return clean_text(soup.title.string)
        
        if soup.find('h1'):
            return clean_text(soup.find('h1').text)
            
        return "Untitled"

    def _extract_body(self, soup, selector=None):
        # Remove only the most common non-content tags
        for tag in soup(['script', 'style', 'iframe', 'noscript']):
            tag.decompose()
            
        if selector and soup.select_one(selector):
            elem = soup.select_one(selector)
            return elem, clean_text(elem.get_text(separator=' '))
            
        # Heuristic: look for article or main
        if soup.find('article'):
            elem = soup.find('article')
            return elem, clean_text(elem.get_text(separator=' '))
            
        if soup.find('main'):
            elem = soup.find('main')
            return elem, clean_text(elem.get_text(separator=' '))
            
        # Fallback to body but try to avoid footer/nav if they are very large
        body = soup.body
        if body:
            # Create a clone to avoid affecting the original soup if needed, 
            # but here we can just work on it.
            # We already removed script/style.
            return body, clean_text(body.get_text(separator=' '))
            
        return None, ""

    def _extract_author(self, soup, selector=None):
        if selector and soup.select_one(selector):
            return clean_text(soup.select_one(selector).text)
            
        # Meta tags
        meta = soup.find('meta', attrs={'name': 'author'}) or soup.find('meta', attrs={'property': 'article:author'})
        if meta: return meta.get('content')
        
        return None

    def _extract_date(self, soup, selector=None):
        date_str = None
        if selector and soup.select_one(selector):
            date_str = soup.select_one(selector).text
        elif soup.find('meta', attrs={'property': 'article:published_time'}):
            date_str = soup.find('meta', attrs={'property': 'article:published_time'}).get('content')
        elif soup.find('meta', attrs={'name': 'pubdate'}):
            date_str = soup.find('meta', attrs={'name': 'pubdate'}).get('content')
            
        if date_str:
            try:
                return dateutil.parser.parse(date_str)
            except:
                pass
        return None

    def _extract_images(self, soup):
        images = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            if not src.startswith('http'): continue
            images.append({
                "url": src,
                "alt": img.get('alt', '')
            })
        return images[:10] # Top 10

    def _extract_links(self, soup, base_url: str = "") -> Dict[str, List[str]]:
        internal = []
        external = []
        
        for a in soup.find_all('a', href=True):
            href = a['href']
            text = clean_text(a.text)
            
            if href.startswith('/'):
                if base_url:
                    full_url = f"{base_url.rstrip('/')}{href}"
                    internal.append({"url": full_url, "text": text})
                else:
                    internal.append({"url": href, "text": text})
            elif base_url and href.startswith(base_url):
                internal.append({"url": href, "text": text})
            elif href.startswith('http'):
                external.append({"url": href, "text": text})
                
        return {
            "internal": internal[:50],
            "external": external[:20]
        }
