"""
Web page parser for extracting content from agent websites using Selenium
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import re
import time
import os
import uuid
from datetime import datetime

class WebPageParser:
    def __init__(self, timeout: int = 60, max_content_length: int = 50000, headless: bool = True):
        self.timeout = timeout
        self.max_content_length = max_content_length
        self.headless = headless
        self.driver = None
        # Use absolute path to avoid permission issues
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Screenshots disabled for simplicity
        self.screenshots_dir = None
        print("📸 Screenshots disabled")

    def _setup_driver(self):
        """Setup Chrome WebDriver with optimal settings and fallback options"""
        if self.driver:
            return

        print("🚀 Setting up Chrome WebDriver...")

        # Try different setup approaches
        setup_errors = []

        # Primary setup (with latest ChromeDriver)
        success = self._try_setup_driver(setup_errors, use_latest=True)
        if success:
            return

        # Fallback 1: Force specific ChromeDriver version
        print("🔄 Trying fallback setup with specific ChromeDriver version...")
        success = self._try_setup_driver(setup_errors, use_latest=False)
        if success:
            return

        # Fallback 2: Minimal Chrome options
        print("🔄 Trying minimal Chrome setup...")
        success = self._try_minimal_setup(setup_errors)
        if success:
            return

        # If all setups failed, raise comprehensive error
        error_msg = "All Chrome WebDriver setup attempts failed:\n" + "\n".join(setup_errors)
        raise Exception(error_msg)

    def _try_setup_driver(self, setup_errors, use_latest=True):
        """Try to setup WebDriver with given configuration"""
        try:
            chrome_options = Options()

            if self.headless:
                chrome_options.add_argument('--headless')

            # Essential performance options
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')

            # Try to find Chrome binary
            chrome_paths = [
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/usr/bin/google-chrome",
                "/usr/bin/google-chrome-stable",
                "/usr/bin/chromium-browser"
            ]

            chrome_binary_found = False
            for chrome_path in chrome_paths:
                if os.path.exists(chrome_path):
                    chrome_options.binary_location = chrome_path
                    chrome_binary_found = True
                    print(f"✅ Found Chrome binary: {chrome_path}")
                    break

            if not chrome_binary_found:
                print("⚠️ No Chrome binary found, trying system default...")

            # Setup ChromeDriver
            from webdriver_manager.chrome import ChromeDriverManager

            # Try different import approaches for ChromeType
            try:
                from webdriver_manager.core.utils import ChromeType
                chrome_type_param = {"chrome_type": ChromeType.GOOGLE}
            except ImportError:
                # Fallback for older webdriver-manager versions
                chrome_type_param = {}

            if use_latest:
                print("📥 Installing latest ChromeDriver...")
                service = Service(ChromeDriverManager(**chrome_type_param).install())
            else:
                # Try a known working version
                print("📥 Installing ChromeDriver v120.0.6099.109...")
                service = Service(ChromeDriverManager(version="120.0.6099.109", **chrome_type_param).install())

            print(f"✅ ChromeDriver ready: {service.path}")

            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.set_page_load_timeout(self.timeout)

            # Stealth settings
            try:
                self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                    "userAgent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            except Exception as stealth_error:
                print(f"⚠️ Stealth settings failed: {stealth_error}")

            print("✅ Chrome WebDriver initialized successfully")
            return True

        except Exception as e:
            error_msg = f"Setup attempt failed: {str(e)}"
            setup_errors.append(error_msg)
            print(f"❌ {error_msg}")

            # Cleanup failed driver
            if hasattr(self, 'driver') and self.driver:
                try:
                    self.driver.quit()
                except:
                    pass
                self.driver = None

            return False

    def _try_minimal_setup(self, setup_errors):
        """Try minimal Chrome setup as last resort"""
        try:
            chrome_options = Options()

            if self.headless:
                chrome_options.add_argument('--headless')

            # Minimal essential options only
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')

            # Try system default Chrome
            print("📥 Trying system Chrome with minimal options...")

            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(self.timeout)

            print("✅ Minimal Chrome WebDriver setup successful")
            return True

        except Exception as e:
            error_msg = f"Minimal setup failed: {str(e)}"
            setup_errors.append(error_msg)
            print(f"❌ {error_msg}")
            return False

    def _handle_popups(self):
        """Try to close common popups and cookie banners"""
        try:
            # Common cookie banner selectors
            cookie_selectors = [
                "button[id*='accept']",
                "button[class*='accept']",
                "button[id*='cookie']",
                "button[class*='cookie']",
                ".cookie-accept",
                ".accept-cookies",
                "#accept-cookies",
                "[data-testid*='accept']",
                "[data-cy*='accept']",
                "button:contains('Accept')",
                "button:contains('OK')",
                "button:contains('Got it')",
                ".close-popup",
                ".popup-close",
                "[aria-label*='close']",
                "[aria-label*='dismiss']"
            ]
            
            for selector in cookie_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        if element.is_displayed() and element.is_enabled():
                            element.click()
                            print(f"✅ Closed popup with selector: {selector}")
                            time.sleep(1)
                            break
                except Exception:
                    continue
                    
        except Exception as e:
            print(f"⚠️ Error handling popups: {e}")

    def _wait_for_images(self):
        """Wait for images to load"""
        try:
            # Wait for images to load
            WebDriverWait(self.driver, 10).until(
                lambda driver: driver.execute_script("""
                    var images = document.querySelectorAll('img');
                    var loaded = 0;
                    for (var i = 0; i < images.length; i++) {
                        if (images[i].complete || images[i].naturalWidth > 0) {
                            loaded++;
                        }
                    }
                    return loaded >= Math.min(images.length, 5); // Wait for at least 5 images or all if less
                """)
            )
            print("✅ Images loaded successfully")
        except TimeoutException:
            print("⚠️ Timeout waiting for images, continuing...")
        except Exception as e:
            print(f"⚠️ Error waiting for images: {e}")

    def parse_website(self, url: str) -> Dict:
        """Parse website and extract relevant content using Selenium"""
        try:
            print(f"🌐 Parsing website with Selenium: {url}")
            
            # Setup driver
            self._setup_driver()
            
            # Additional stealth script (webdriver property already set in setup)
            
            # Navigate to page
            self.driver.get(url)
            
            # Wait for page to load with multiple strategies
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
            except TimeoutException:
                print("⚠️ Body element not found, trying alternative wait...")
                time.sleep(5)
            
            # Wait for document ready state
            WebDriverWait(self.driver, 10).until(
                lambda driver: driver.execute_script("return document.readyState") == "complete"
            )
            
            # Additional wait for dynamic content and JavaScript execution
            time.sleep(5)
            
            # Try to close cookie banners and popups
            self._handle_popups()
            
            # Wait for images and other resources to load
            self._wait_for_images()
            
            # Try to scroll to trigger lazy loading
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(3)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(3)
            
            # Final wait for any remaining dynamic content
            time.sleep(5)
            
            # Screenshots disabled
            screenshot_path = None
            
            # Get page source and parse with BeautifulSoup
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'lxml')
            
            # Extract content
            result = {
                'url': url,
                'title': self._extract_title(soup),
                'description': self._extract_description(soup),
                'headings': self._extract_headings(soup),
                'main_content': self._extract_main_content(soup),
                'features': self._extract_features(soup),
                'keywords': self._extract_keywords(soup),
                'pricing_info': self._extract_pricing_info(soup),
                'contact_info': self._extract_contact_info(soup),
                'social_links': self._extract_social_links(soup),
                'technology_stack': self._extract_technology_stack(soup),
                'screenshot': screenshot_path
            }
            
            print(f"✅ Successfully parsed: {result['title']}")
            return result
            
        except TimeoutException as e:
            print(f"❌ Timeout error for {url}: {e}")
            print("💡 Timeout suggestions:")
            print("   - Try increasing timeout value")
            print("   - Check if website is accessible")
            print("   - Consider using a proxy if blocked")
            return {'error': f'Page load timeout: {str(e)}', 'url': url}
        except WebDriverException as e:
            error_str = str(e).lower()
            print(f"❌ WebDriver error for {url}: {e}")

            # Provide specific guidance based on error type
            if 'chrome failed to start' in error_str or 'status code was: -5' in error_str:
                print("💡 Chrome startup error suggestions:")
                print("   - Ensure Chrome browser is installed")
                print("   - Check Chrome version compatibility")
                print("   - Try clearing Chrome cache and restarting")
                print("   - Check system resources (memory, disk space)")
            elif 'session not created' in error_str:
                print("💡 Session creation error suggestions:")
                print("   - ChromeDriver version may be incompatible")
                print("   - Try updating webdriver-manager")
                print("   - Check Chrome browser updates")
            elif 'net::err' in error_str:
                print("💡 Network error suggestions:")
                print("   - Check internet connection")
                print("   - Website may be blocking requests")
                print("   - Try using a different user agent")
            else:
                print("💡 General WebDriver error suggestions:")
                print("   - Try restarting the application")
                print("   - Check ChromeDriver and Chrome versions")
                print("   - Clear webdriver-manager cache")

            return {'error': f'WebDriver error: {str(e)}', 'url': url}
        except Exception as e:
            print(f"❌ Parse error for {url}: {e}")
            print("💡 General parsing error suggestions:")
            print("   - Check if URL is valid and accessible")
            print("   - Website structure may have changed")
            print("   - Try with different parsing options")
            return {'error': f'Failed to parse page: {str(e)}', 'url': url}
        finally:
            # Clean up driver
            if self.driver:
                try:
                    self.driver.quit()
                    self.driver = None
                except:
                    pass


    def clear_webdriver_cache(self):
        """Clear webdriver-manager cache to force fresh download"""
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            import shutil

            # Get cache path
            cache_path = ChromeDriverManager().driver_cache.find_driver_path()
            cache_dir = os.path.dirname(cache_path) if cache_path else None

            if cache_dir and os.path.exists(cache_dir):
                print(f"🗑️ Clearing webdriver cache: {cache_dir}")
                shutil.rmtree(cache_dir)
                print("✅ Webdriver cache cleared")
            else:
                print("ℹ️ No webdriver cache found to clear")

        except Exception as e:
            print(f"⚠️ Failed to clear webdriver cache: {e}")

    def get_system_info(self):
        """Get system information for debugging"""
        info = {
            'chrome_version': 'Not found',
            'chrome_paths': [],
            'webdriver_cache': 'Not found'
        }

        # Check Chrome versions
        chrome_paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium-browser"
        ]

        import subprocess
        for path in chrome_paths:
            if os.path.exists(path):
                info['chrome_paths'].append(path)
                try:
                    result = subprocess.run([path, '--version'], capture_output=True, text=True, timeout=5)
                    if result.returncode == 0:
                        info['chrome_version'] = result.stdout.strip()
                        break
                except:
                    pass

        # Check webdriver cache
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            cache_path = ChromeDriverManager().driver_cache.find_driver_path()
            if cache_path:
                info['webdriver_cache'] = cache_path
        except:
            pass

        return info

    def __del__(self):
        """Cleanup driver on object destruction"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        # Try different title sources
        title = None
        
        # Meta title
        if not title:
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text().strip()
        
        # H1 as fallback
        if not title or len(title) < 5:
            h1 = soup.find('h1')
            if h1:
                title = h1.get_text().strip()
        
        return title or 'No title found'

    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract page description"""
        # Try meta description first
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Try Open Graph description
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc and og_desc.get('content'):
            return og_desc['content'].strip()
        
        # Try first paragraph
        first_p = soup.find('p')
        if first_p:
            text = first_p.get_text().strip()
            if len(text) > 50:
                return text[:500] + '...' if len(text) > 500 else text
        
        return 'No description found'

    def _extract_headings(self, soup: BeautifulSoup) -> List[str]:
        """Extract all headings (h1-h6)"""
        headings = []
        for i in range(1, 7):
            for heading in soup.find_all(f'h{i}'):
                text = heading.get_text().strip()
                if text and len(text) > 2:
                    headings.append(text)
        return headings[:20]  # Limit to first 20 headings

    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main text content"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Try to find main content area
        main_content = None
        for selector in ['main', '[role="main"]', '.main-content', '#main', '.content']:
            main_content = soup.select_one(selector)
            if main_content:
                break
        
        if not main_content:
            main_content = soup.find('body')
        
        if main_content:
            text = main_content.get_text()
            # Clean up text
            text = re.sub(r'\s+', ' ', text).strip()
            # Limit length
            if len(text) > self.max_content_length:
                text = text[:self.max_content_length] + '...'
            return text
        
        return 'No main content found'

    def _extract_features(self, soup: BeautifulSoup) -> List[str]:
        """Extract feature list"""
        features = []
        
        # Look for common feature patterns
        feature_selectors = [
            '.feature', '.features li', '.benefit', '.benefits li',
            '.capability', '.capabilities li', '[class*="feature"]',
            '.service', '.services li'
        ]
        
        for selector in feature_selectors:
            elements = soup.select(selector)
            for element in elements:
                text = element.get_text().strip()
                if text and len(text) > 5 and len(text) < 200:
                    features.append(text)
        
        return list(set(features))[:15]  # Remove duplicates, limit to 15

    def _extract_keywords(self, soup: BeautifulSoup) -> List[str]:
        """Extract keywords from meta tags and content"""
        keywords = []
        
        # Meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords and meta_keywords.get('content'):
            keywords.extend([k.strip() for k in meta_keywords['content'].split(',')])
        
        # Extract from title and headings
        title = self._extract_title(soup)
        headings = self._extract_headings(soup)
        
        # Simple keyword extraction (this could be improved with NLP)
        text = f"{title} {' '.join(headings)}"
        
        # Look for AI/tech related terms
        tech_terms = [
            'AI', 'artificial intelligence', 'machine learning', 'ML', 'automation',
            'chatbot', 'assistant', 'API', 'SaaS', 'platform', 'tool', 'service',
            'analytics', 'data', 'workflow', 'productivity', 'business', 'enterprise'
        ]
        
        for term in tech_terms:
            if term.lower() in text.lower():
                keywords.append(term)
        
        return list(set(keywords))[:20]

    def _extract_pricing_info(self, soup: BeautifulSoup) -> Dict:
        """Extract pricing information"""
        pricing = {'has_pricing': False, 'pricing_model': 'unknown', 'price_indicators': []}
        
        # Look for pricing indicators
        pricing_text = soup.get_text().lower()
        
        if any(word in pricing_text for word in ['free', 'trial', 'demo']):
            pricing['has_free_tier'] = True
        
        if any(word in pricing_text for word in ['$', 'price', 'cost', 'subscription', 'plan']):
            pricing['has_pricing'] = True
        
        if 'subscription' in pricing_text or 'monthly' in pricing_text:
            pricing['pricing_model'] = 'subscription'
        elif 'one-time' in pricing_text or 'lifetime' in pricing_text:
            pricing['pricing_model'] = 'one-time'
        
        return pricing

    def _extract_contact_info(self, soup: BeautifulSoup) -> Dict:
        """Extract contact information"""
        contact = {}
        
        # Look for email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, soup.get_text())
        if emails:
            contact['emails'] = list(set(emails))[:3]
        
        return contact

    def _extract_social_links(self, soup: BeautifulSoup) -> List[str]:
        """Extract social media links"""
        social_domains = ['twitter.com', 'linkedin.com', 'github.com', 'facebook.com', 'instagram.com']
        social_links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            for domain in social_domains:
                if domain in href:
                    social_links.append(href)
                    break
        
        return list(set(social_links))

    def _extract_technology_stack(self, soup: BeautifulSoup) -> List[str]:
        """Extract technology stack information"""
        tech_stack = []
        
        # Look for common tech terms in content
        tech_terms = [
            'React', 'Vue', 'Angular', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
            'API', 'REST', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
            'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes'
        ]
        
        content = soup.get_text().lower()
        for term in tech_terms:
            if term.lower() in content:
                tech_stack.append(term)
        
        return list(set(tech_stack))
