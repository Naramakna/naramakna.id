#!/usr/bin/env python3
"""
Naramakna Analytics Booster
Advanced traffic simulation with realistic user behavior patterns
"""

import requests
import random
import time
import json
from urllib.parse import urljoin, urlparse
from datetime import datetime, timedelta
import threading
import queue

class AnalyticsBooster:
    def __init__(self, target_site="https://naramakna.id"):
        self.target_site = target_site
        self.session_pool = []
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0'
        ]

        self.referrers = [
            'https://www.google.com/search?q=berita+terbaru',
            'https://www.google.com/search?q=naramakna',
            'https://www.google.com/search?q=analisis+politik',
            'https://www.bing.com/search?q=media+digital',
            'https://duckduckgo.com/?q=jurnalisme+data',
            'https://www.facebook.com/',
            'https://twitter.com/',
            'https://t.co/randomlink',
            '',  # Direct traffic
            'https://news.google.com/',
            'https://www.linkedin.com/'
        ]

        self.search_terms = [
            'berita terbaru indonesia',
            'analisis politik',
            'jurnalisme data',
            'media digital indonesia',
            'naramakna berita',
            'politik ekonomi',
            'data analysis',
            'trending news'
        ]

        # Popular pages to visit
        self.pages = [
            '/',
            '/kategori/narapandang',
            '/kategori/data-bicara',
            '/kategori/pelakon',
            '/tentang-kami',
            '/polling',
            '/video-story'
        ]

    def create_session(self):
        """Create a new session with realistic headers"""
        session = requests.Session()

        # Random user agent
        user_agent = random.choice(self.user_agents)

        # Set realistic headers
        headers = {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }

        session.headers.update(headers)
        return session

    def simulate_user_session(self, session_id=None):
        """Simulate a realistic user session"""
        session = self.create_session()

        try:
            # Random session duration (2-20 minutes)
            session_duration = random.randint(120, 1200)
            pages_to_visit = random.randint(1, 7)

            print(f"[{datetime.now().strftime('%H:%M:%S')}] Session {session_id}: {pages_to_visit} pages, {session_duration}s duration")

            # Set referrer
            referrer = random.choice(self.referrers)
            if referrer:
                session.headers['Referer'] = referrer

            visited_pages = []
            start_time = time.time()

            for page_num in range(pages_to_visit):
                # Select page (higher chance for homepage first)
                if page_num == 0 and random.random() < 0.4:
                    page = '/'
                else:
                    page = random.choice(self.pages)

                # Avoid visiting same page twice
                if page in visited_pages:
                    continue

                visited_pages.append(page)

                # Visit page
                url = urljoin(self.target_site, page)

                try:
                    # Random delay between page visits (3-45 seconds)
                    if page_num > 0:
                        delay = random.randint(3, 45)
                        time.sleep(delay)

                    # Make request
                    response = session.get(url, timeout=10)

                    if response.status_code == 200:
                        print(f"  ✓ Visited: {page} ({response.status_code})")

                        # Simulate reading time
                        reading_time = random.randint(10, 180)
                        time.sleep(min(reading_time, 30))  # Cap at 30s for script efficiency

                        # Random chance to trigger GA events
                        if random.random() < 0.3:
                            self.trigger_engagement_events(session, url)

                    else:
                        print(f"  ✗ Failed: {page} ({response.status_code})")

                except requests.RequestException as e:
                    print(f"  ✗ Error visiting {page}: {str(e)}")
                    continue

                # Check if session duration exceeded
                if time.time() - start_time > session_duration:
                    break

            print(f"[{datetime.now().strftime('%H:%M:%S')}] Session {session_id} completed: {len(visited_pages)} pages visited")

        except Exception as e:
            print(f"Session {session_id} error: {str(e)}")
        finally:
            session.close()

    def trigger_engagement_events(self, session, current_url):
        """Trigger additional engagement events"""
        try:
            # Simulate scroll events by making additional requests
            events = ['scroll', 'click', 'search']
            event = random.choice(events)

            if event == 'search' and '/kategori/' not in current_url:
                # Simulate search
                search_term = random.choice(self.search_terms)
                search_url = f"{self.target_site}/?s={search_term.replace(' ', '+')}"
                session.get(search_url, timeout=5)
                print(f"    🔍 Search: {search_term}")

            elif event == 'click':
                # Simulate category navigation
                category_page = random.choice(self.pages[1:4])  # Category pages
                category_url = urljoin(self.target_site, category_page)
                session.get(category_url, timeout=5)
                print(f"    👆 Click: {category_page}")

        except:
            pass  # Ignore errors in engagement events

    def boost_traffic(self, sessions_per_hour=100, duration_hours=1):
        """Main function to boost traffic"""
        total_sessions = sessions_per_hour * duration_hours
        session_interval = 3600 / sessions_per_hour  # seconds between sessions

        print(f"🚀 Starting traffic boost:")
        print(f"   Target: {self.target_site}")
        print(f"   Sessions: {total_sessions} ({sessions_per_hour}/hour)")
        print(f"   Duration: {duration_hours} hours")
        print(f"   Interval: {session_interval:.1f}s between sessions")
        print("-" * 50)

        session_queue = queue.Queue()

        # Create worker threads
        def worker():
            while True:
                session_id = session_queue.get()
                if session_id is None:
                    break
                self.simulate_user_session(session_id)
                session_queue.task_done()

        # Start worker threads
        num_workers = min(10, sessions_per_hour // 10 + 1)
        threads = []
        for i in range(num_workers):
            t = threading.Thread(target=worker)
            t.start()
            threads.append(t)

        try:
            # Generate sessions
            for session_id in range(1, total_sessions + 1):
                session_queue.put(session_id)

                # Random interval with some variation
                actual_interval = session_interval + random.uniform(-2, 2)
                time.sleep(max(1, actual_interval))

            # Wait for all sessions to complete
            session_queue.join()

        except KeyboardInterrupt:
            print("\n⚠️  Stopping traffic boost...")

        finally:
            # Stop workers
            for _ in threads:
                session_queue.put(None)
            for t in threads:
                t.join()

        print("✅ Traffic boost completed!")

    def quick_boost(self, visits=50):
        """Quick boost for immediate results"""
        print(f"⚡ Quick boost: {visits} visits")

        for i in range(visits):
            self.simulate_user_session(f"QB-{i+1}")
            # Short delay between visits
            time.sleep(random.uniform(1, 3))

        print("✅ Quick boost completed!")

def main():
    booster = AnalyticsBooster("https://naramakna.id")

    print("Naramakna Analytics Booster")
    print("=" * 30)
    print("1. Quick Boost (50 visits)")
    print("2. Standard Boost (100 visits/hour for 1 hour)")
    print("3. Heavy Boost (200 visits/hour for 2 hours)")
    print("4. Custom Boost")

    try:
        choice = input("\nSelect option (1-4): ").strip()

        if choice == "1":
            booster.quick_boost(50)
        elif choice == "2":
            booster.boost_traffic(sessions_per_hour=100, duration_hours=1)
        elif choice == "3":
            booster.boost_traffic(sessions_per_hour=200, duration_hours=2)
        elif choice == "4":
            sessions = int(input("Sessions per hour: "))
            hours = int(input("Duration (hours): "))
            booster.boost_traffic(sessions_per_hour=sessions, duration_hours=hours)
        else:
            print("Invalid option!")

    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()