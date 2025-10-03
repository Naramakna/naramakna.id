#!/usr/bin/env python3
"""
Quick 2-minute analytics boost test
"""

import requests
import random
import time
from datetime import datetime

class QuickTester:
    def __init__(self, target_site="https://naramakna.id"):
        self.target_site = target_site
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
        ]

        self.pages = ['/', '/kategori/narapandang', '/kategori/data-bicara', '/tentang-kami']

    def quick_session(self, session_id):
        """Super quick session - 3-5 seconds per session"""
        try:
            session = requests.Session()
            session.headers.update({
                'User-Agent': random.choice(self.user_agents),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            })

            # Quick page visit
            page = random.choice(self.pages)
            url = self.target_site + page

            response = session.get(url, timeout=5)

            if response.status_code == 200:
                print(f"✓ {session_id}: {page} ({response.status_code})")
                # Quick pause to simulate reading
                time.sleep(random.uniform(1, 2))
                return True
            else:
                print(f"✗ {session_id}: {page} ({response.status_code})")
                return False

        except Exception as e:
            print(f"✗ {session_id}: Error - {str(e)[:30]}")
            return False
        finally:
            session.close()

def main():
    print("⚡ Quick 2-minute Analytics Test")
    print("=" * 35)

    tester = QuickTester()
    start_time = time.time()
    session_count = 0
    success_count = 0

    try:
        while time.time() - start_time < 120:  # 2 minutes
            session_count += 1

            if tester.quick_session(f"QT-{session_count}"):
                success_count += 1

            # Very short delay between sessions
            time.sleep(random.uniform(0.5, 1.5))

    except KeyboardInterrupt:
        print("\n⚠️ Test stopped by user")

    elapsed = time.time() - start_time

    print(f"\n📊 Test Results:")
    print(f"   Time: {elapsed:.1f} seconds")
    print(f"   Total sessions: {session_count}")
    print(f"   Successful: {success_count}")
    print(f"   Success rate: {success_count/session_count*100:.1f}%")
    print(f"   Rate: {session_count/elapsed*60:.1f} sessions/minute")
    print(f"   Projected hourly: {session_count/elapsed*3600:.0f} sessions")

if __name__ == "__main__":
    main()