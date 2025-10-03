#!/usr/bin/env python3
"""
Stealth Analytics Booster - Advanced version with anti-detection
"""

import requests
import random
import time
import json
from urllib.parse import urljoin, urlparse, parse_qs
from datetime import datetime, timedelta
import threading
import queue
import hashlib
import uuid

class StealthBooster:
    def __init__(self, target_site="https://naramakna.id"):
        self.target_site = target_site
        self.ga_tracking_id = "G-XXXXXXXXXX"  # Replace with actual GA4 ID

        # More sophisticated user agents with versions
        self.user_agents = [
            # Chrome Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            # Chrome Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            # Firefox
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
            # Safari
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            # Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            # Mobile
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36'
        ]

        # Realistic referrers dengan search queries
        self.organic_referrers = [
            'https://www.google.com/search?q=berita+politik+terbaru+indonesia',
            'https://www.google.com/search?q=analisis+ekonomi+indonesia+2025',
            'https://www.google.com/search?q=naramakna+media',
            'https://www.google.com/search?q=jurnalisme+data+indonesia',
            'https://www.google.com/search?q=berita+terkini+hari+ini',
            'https://www.bing.com/search?q=media+digital+indonesia',
            'https://www.bing.com/search?q=portal+berita+terpercaya',
            'https://duckduckgo.com/?q=analisis+politik+indonesia',
            'https://search.yahoo.com/search?p=berita+nasional',
        ]

        self.social_referrers = [
            'https://www.facebook.com/',
            'https://m.facebook.com/',
            'https://twitter.com/',
            'https://t.co/AbCdEfG123',
            'https://www.linkedin.com/feed/',
            'https://www.instagram.com/',
            'https://wa.me/',
            'https://telegram.org/',
        ]

        # Indonesian cities for more realistic geographic diversity
        self.cities = [
            'Jakarta', 'Surabaya', 'Bandung', 'Bekasi', 'Medan',
            'Tangerang', 'Depok', 'Semarang', 'Palembang', 'Makassar',
            'Batam', 'Bogor', 'Pekanbaru', 'Bandar Lampung', 'Malang',
            'Yogyakarta', 'Padang', 'Denpasar', 'Samarinda', 'Balikpapan'
        ]

    def generate_client_id(self):
        """Generate unique client ID for GA4"""
        return str(random.randint(1000000000, 9999999999)) + '.' + str(int(time.time()))

    def create_stealth_session(self):
        """Create session with advanced anti-detection"""
        session = requests.Session()

        # Random user agent
        user_agent = random.choice(self.user_agents)

        # Extract browser info for consistent headers
        is_mobile = 'Mobile' in user_agent or 'iPhone' in user_agent
        is_chrome = 'Chrome' in user_agent
        is_firefox = 'Firefox' in user_agent
        is_safari = 'Safari' in user_agent and 'Chrome' not in user_agent

        # Build realistic headers based on user agent
        headers = {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }

        # Browser-specific headers
        if is_chrome:
            headers['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"'
            headers['sec-ch-ua-mobile'] = '?1' if is_mobile else '?0'
            headers['sec-ch-ua-platform'] = '"Android"' if is_mobile else '"Windows"'

        if is_mobile:
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'

        session.headers.update(headers)

        # Random session properties
        session.client_id = self.generate_client_id()
        session.session_start = int(time.time())
        session.page_view_count = 0

        return session

    def simulate_realistic_behavior(self, session, url):
        """Simulate human-like behavior on page"""
        behaviors = []

        # Simulate page load time
        load_time = random.uniform(0.8, 3.2)
        time.sleep(load_time)

        # Reading time based on content type
        if '/artikel/' in url:
            reading_time = random.randint(45, 300)  # 45s - 5min for articles
        elif url == '/':
            reading_time = random.randint(10, 60)   # 10s - 1min for homepage
        else:
            reading_time = random.randint(15, 120)  # 15s - 2min for other pages

        # Simulate scroll events (multiple small scrolls)
        scroll_events = random.randint(3, 12)
        for i in range(scroll_events):
            scroll_delay = reading_time / scroll_events + random.uniform(-2, 2)
            time.sleep(max(1, scroll_delay))

            # Chance to pause (simulate reading interesting section)
            if random.random() < 0.2:
                time.sleep(random.uniform(5, 15))

        return behaviors

    def get_realistic_referrer(self):
        """Get realistic referrer based on traffic source distribution"""
        source_type = random.choices(
            ['organic', 'social', 'direct', 'referral'],
            weights=[45, 25, 20, 10]  # Realistic traffic distribution
        )[0]

        if source_type == 'organic':
            return random.choice(self.organic_referrers)
        elif source_type == 'social':
            return random.choice(self.social_referrers)
        elif source_type == 'direct':
            return ''
        else:
            # Referral from news sites
            return random.choice([
                'https://news.detik.com/',
                'https://www.kompas.com/',
                'https://tirto.id/',
                'https://www.cnnindonesia.com/'
            ])

    def send_ga4_event(self, session, event_name, url, additional_params=None):
        """Send event to Google Analytics 4"""
        if not hasattr(session, 'client_id'):
            return

        # GA4 Measurement Protocol endpoint
        ga_url = f"https://www.google-analytics.com/mp/collect?measurement_id={self.ga_tracking_id}&api_secret=YOUR_API_SECRET"

        # Base event data
        event_data = {
            "client_id": session.client_id,
            "events": [{
                "name": event_name,
                "params": {
                    "page_location": url,
                    "page_title": "Naramakna - Cerdas Memaknai",
                    "session_id": session.session_start,
                    "engagement_time_msec": random.randint(1000, 30000)
                }
            }]
        }

        if additional_params:
            event_data["events"][0]["params"].update(additional_params)

        try:
            # Note: This requires proper GA4 setup with API secret
            # For now, we'll just simulate the call
            print(f"    📊 GA4 Event: {event_name}")
        except:
            pass

    def advanced_user_session(self, session_id=None):
        """Advanced user session with realistic patterns"""
        session = self.create_stealth_session()

        try:
            # Session characteristics
            session_duration = random.choices(
                [30, 120, 300, 600, 1200],  # 30s, 2m, 5m, 10m, 20m
                weights=[10, 30, 35, 20, 5]  # Most sessions are 2-5 minutes
            )[0]

            pages_to_visit = min(random.choices(
                [1, 2, 3, 4, 5, 6, 7, 8],
                weights=[25, 20, 20, 15, 10, 5, 3, 2]  # Most users visit 1-3 pages
            )[0], session_duration // 30)

            # Set referrer
            referrer = self.get_realistic_referrer()
            if referrer:
                session.headers['Referer'] = referrer

            print(f"[{datetime.now().strftime('%H:%M:%S')}] Session {session_id}: {pages_to_visit} pages, {session_duration}s, ref: {referrer[:50] if referrer else 'direct'}")

            visited_pages = []
            start_time = time.time()

            for page_num in range(pages_to_visit):
                # Page selection logic
                if page_num == 0:
                    # Entry page based on referrer
                    if 'search' in referrer.lower():
                        # From search - might land on article or category
                        if random.random() < 0.6:
                            page = random.choice(['/kategori/narapandang', '/kategori/data-bicara', '/'])
                        else:
                            page = '/'  # Will be replaced with actual article if available
                    else:
                        # Social/direct traffic usually goes to homepage
                        page = '/'
                else:
                    # Subsequent pages - realistic navigation patterns
                    if visited_pages[-1] == '/':
                        # From homepage, likely to go to category or article
                        page = random.choice([
                            '/kategori/narapandang',
                            '/kategori/data-bicara',
                            '/kategori/pelakon',
                            '/tentang-kami',
                            '/polling'
                        ])
                    else:
                        # From category/article, might go to related or back to home
                        page = random.choice([
                            '/',
                            '/kategori/narapandang',
                            '/kategori/data-bicara',
                            '/tentang-kami'
                        ])

                # Avoid immediate revisits
                if page in visited_pages:
                    continue

                visited_pages.append(page)
                url = urljoin(self.target_site, page)

                try:
                    # Realistic delay between pages
                    if page_num > 0:
                        delay = random.choices(
                            [3, 8, 15, 30, 60],
                            weights=[40, 30, 20, 8, 2]  # Most transitions are quick
                        )[0] + random.uniform(-1, 2)
                        time.sleep(max(1, delay))

                    # Make request
                    response = session.get(url, timeout=15)
                    session.page_view_count += 1

                    if response.status_code == 200:
                        print(f"  ✓ Page {page_num+1}: {page} ({response.status_code})")

                        # Simulate realistic page behavior
                        self.simulate_realistic_behavior(session, url)

                        # Send GA4 events
                        self.send_ga4_event(session, 'page_view', url)

                        # Random engagement events
                        if random.random() < 0.15:  # 15% chance
                            self.send_ga4_event(session, 'scroll', url, {
                                'percent_scrolled': random.randint(25, 100)
                            })

                    else:
                        print(f"  ✗ Failed: {page} ({response.status_code})")

                except requests.RequestException as e:
                    print(f"  ✗ Error: {page} - {str(e)[:50]}")
                    continue

                # Check session timeout
                if time.time() - start_time > session_duration:
                    break

            # Session end event
            if session.page_view_count > 0:
                self.send_ga4_event(session, 'session_start', visited_pages[0] if visited_pages else '/')

            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Session {session_id}: {len(visited_pages)} pages, {int(time.time() - start_time)}s duration")

        except Exception as e:
            print(f"❌ Session {session_id} error: {str(e)}")
        finally:
            session.close()

    def intelligent_boost(self, target_daily_visitors=1000, hours_to_run=8):
        """Intelligent boost with realistic traffic patterns"""
        visitors_per_hour = target_daily_visitors // 24
        sessions_per_hour = int(visitors_per_hour * random.uniform(1.2, 1.8))  # Some users have multiple sessions

        print(f"🧠 Intelligent Analytics Boost")
        print(f"   Target: {target_daily_visitors} daily visitors")
        print(f"   Running: {hours_to_run} hours")
        print(f"   Sessions/hour: ~{sessions_per_hour}")
        print(f"   Site: {self.target_site}")
        print("-" * 50)

        session_queue = queue.Queue()

        def worker():
            while True:
                session_data = session_queue.get()
                if session_data is None:
                    break
                session_id, delay = session_data
                time.sleep(delay)  # Stagger start times
                self.advanced_user_session(session_id)
                session_queue.task_done()

        # Start workers
        num_workers = min(15, sessions_per_hour // 5 + 1)
        threads = []
        for i in range(num_workers):
            t = threading.Thread(target=worker)
            t.daemon = True
            t.start()
            threads.append(t)

        try:
            total_sessions = 0
            start_time = time.time()

            for hour in range(hours_to_run):
                hour_start = time.time()

                # Vary sessions per hour (peak/off-peak simulation)
                hour_multiplier = random.uniform(0.7, 1.4)
                if 9 <= (datetime.now().hour) <= 17:  # Business hours
                    hour_multiplier *= 1.3
                elif 19 <= (datetime.now().hour) <= 22:  # Evening peak
                    hour_multiplier *= 1.5

                current_hour_sessions = int(sessions_per_hour * hour_multiplier)

                print(f"\n🕐 Hour {hour+1}/{hours_to_run}: {current_hour_sessions} sessions planned")

                for session_in_hour in range(current_hour_sessions):
                    total_sessions += 1

                    # Random delay within the hour
                    delay = random.uniform(0, 3600 / current_hour_sessions)
                    session_queue.put((f"H{hour+1}-{session_in_hour+1}", delay))

                # Wait for hour to complete
                remaining_time = 3600 - (time.time() - hour_start)
                if remaining_time > 0:
                    time.sleep(remaining_time)

            # Wait for all sessions to complete
            session_queue.join()

        except KeyboardInterrupt:
            print("\n⚠️  Stopping intelligent boost...")
        finally:
            # Stop workers
            for _ in threads:
                session_queue.put(None)

        print(f"\n✅ Intelligent boost completed!")
        print(f"   Total sessions: {total_sessions}")
        print(f"   Duration: {(time.time() - start_time) / 3600:.1f} hours")

def main():
    booster = StealthBooster("https://naramakna.id")

    print("🥷 Naramakna Stealth Analytics Booster")
    print("=" * 40)
    print("1. Quick Stealth (100 sessions)")
    print("2. Daily Boost (1000 visitors/day, 8 hours)")
    print("3. Heavy Boost (2000 visitors/day, 12 hours)")
    print("4. Custom Intelligent Boost")
    print("5. Continuous Boost (24/7 mode)")

    try:
        choice = input("\nSelect option (1-5): ").strip()

        if choice == "1":
            print("🚀 Starting quick stealth boost...")
            for i in range(100):
                booster.advanced_user_session(f"QS-{i+1}")
                time.sleep(random.uniform(1, 4))

        elif choice == "2":
            booster.intelligent_boost(target_daily_visitors=1000, hours_to_run=8)

        elif choice == "3":
            booster.intelligent_boost(target_daily_visitors=2000, hours_to_run=12)

        elif choice == "4":
            visitors = int(input("Target daily visitors: "))
            hours = int(input("Hours to run: "))
            booster.intelligent_boost(target_daily_visitors=visitors, hours_to_run=hours)

        elif choice == "5":
            print("🔄 Continuous mode - Press Ctrl+C to stop")
            while True:
                booster.intelligent_boost(target_daily_visitors=800, hours_to_run=6)
                time.sleep(3600)  # 1 hour break between cycles

        else:
            print("Invalid option!")

    except KeyboardInterrupt:
        print("\n👋 Stealth mode deactivated!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()