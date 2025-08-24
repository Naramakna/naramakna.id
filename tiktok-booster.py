#!/usr/bin/env python3
"""
TikTok View Booster
Automatically boost TikTok views when users watch videos on website
"""

import asyncio
import aiohttp
import random
import time
import mysql.connector
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import json
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tiktok-booster.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TikTokViewBooster:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        
        # User agents untuk randomization
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0'
        ]
    
    def get_db_connection(self):
        """Get database connection"""
        return mysql.connector.connect(**self.db_config)
    
    def get_pending_boosts(self):
        """Get videos that need view boosting with smart detection"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Smart detection - look for videos with recent activity but not too frequent boost
            query = """
            SELECT DISTINCT tv.tiktok_video_id, tv.share_url, tv.title, tv.tiktok_view_count,
                   COUNT(tvv.id) as recent_views,
                   MAX(tvv.viewed_at) as last_view
            FROM tiktok_videos tv
            JOIN tiktok_video_views tvv ON tv.id = tvv.video_id
            WHERE tvv.viewed_at >= %s 
            AND tv.share_url IS NOT NULL 
            AND tv.share_url != ''
            GROUP BY tv.id
            HAVING recent_views > 0
            ORDER BY recent_views DESC, last_view DESC
            LIMIT 5
            """
            
            # Look back further for more natural distribution
            lookback_time = datetime.now() - timedelta(minutes=random.randint(10, 20))
            cursor.execute(query, (lookback_time,))
            results = cursor.fetchall()
            
            # Filter to avoid over-boosting popular videos
            filtered_results = []
            for video in results:
                # Skip if video already has very high views (might look suspicious)
                if video['tiktok_view_count'] and video['tiktok_view_count'] > 10000:
                    if random.random() > 0.3:  # Only 30% chance to boost high-view videos
                        continue
                
                filtered_results.append(video)
            
            cursor.close()
            conn.close()
            
            return filtered_results[:3]  # Max 3 videos per cycle for natural growth
        except Exception as e:
            logger.error(f"Database error: {e}")
            return []
    
    async def boost_video_views(self, session, video_data, boost_count=None):
        """Boost views for a specific video with organic patterns"""
        try:
            share_url = video_data['share_url']
            video_id = video_data['tiktok_video_id']
            title = video_data.get('title', 'Unknown')[:30]
            
            if not boost_count:
                # Organic growth algorithm - more natural patterns
                recent_views = video_data['recent_views']
                
                # Scale based on engagement but keep it natural
                if recent_views <= 2:
                    boost_count = random.randint(1, 3)  # Low activity
                elif recent_views <= 5:
                    boost_count = random.randint(2, 4)  # Medium activity  
                else:
                    boost_count = random.randint(3, 6)  # High activity - but still reasonable
                
                # Add randomness to avoid patterns
                boost_count = max(1, boost_count + random.randint(-1, 1))
            
            logger.info(f"🚀 Boosting '{title}' - Target: {boost_count} views")
            
            successful_boosts = 0
            
            for i in range(boost_count):
                try:
                    # Natural delay patterns - mimic human behavior
                    if i == 0:
                        await asyncio.sleep(random.uniform(3, 8))  # Initial delay
                    else:
                        # Progressive delays - humans slow down over time
                        base_delay = 8 + (i * 2)  # Increase delay with each request
                        natural_delay = random.uniform(base_delay, base_delay + 10)
                        await asyncio.sleep(natural_delay)
                    
                    # Random user agent
                    headers = {
                        'User-Agent': random.choice(self.user_agents),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                    
                    # Add some randomization to appear more natural
                    if random.random() < 0.3:  # 30% chance
                        headers['Referer'] = random.choice([
                            'https://www.google.com/',
                            'https://www.facebook.com/',
                            'https://twitter.com/',
                            'https://naramakna.id/'
                        ])
                    
                    timeout = aiohttp.ClientTimeout(total=15)
                    
                    async with session.get(
                        share_url, 
                        headers=headers, 
                        timeout=timeout,
                        allow_redirects=True
                    ) as response:
                        if response.status == 200:
                            successful_boosts += 1
                            logger.info(f"✅ Boost {i+1}/{boost_count} successful for {video_id}")
                        else:
                            logger.warning(f"⚠️ Boost {i+1} failed: HTTP {response.status}")
                            
                except asyncio.TimeoutError:
                    logger.warning(f"⏰ Boost {i+1} timed out")
                except Exception as e:
                    logger.warning(f"❌ Boost {i+1} error: {e}")
            
            logger.info(f"🎯 Completed boosting '{title}': {successful_boosts}/{boost_count} successful")
            return successful_boosts
            
        except Exception as e:
            logger.error(f"Error boosting video {video_data.get('tiktok_video_id', 'unknown')}: {e}")
            return 0
    
    async def run_boost_cycle(self):
        """Run one cycle of view boosting"""
        try:
            pending_videos = self.get_pending_boosts()
            
            if not pending_videos:
                logger.info("📭 No videos need boosting right now")
                return
            
            logger.info(f"🎬 Found {len(pending_videos)} videos to boost")
            
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
            timeout = aiohttp.ClientTimeout(total=30)
            
            async with aiohttp.ClientSession(
                connector=connector, 
                timeout=timeout
            ) as session:
                
                # Process videos concurrently but with limits
                semaphore = asyncio.Semaphore(3)  # Max 3 concurrent boosts
                
                async def bounded_boost(video_data):
                    async with semaphore:
                        return await self.boost_video_views(session, video_data)
                
                tasks = [bounded_boost(video) for video in pending_videos]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                total_boosts = sum(r for r in results if isinstance(r, int))
                logger.info(f"🏆 Boost cycle completed: {total_boosts} total successful boosts")
                
        except Exception as e:
            logger.error(f"Error in boost cycle: {e}")
    
    async def start_booster(self):
        """Start the continuous boosting service"""
        logger.info("🚀 TikTok View Booster started!")
        logger.info("⚡ Monitoring for website video views...")
        
        while True:
            try:
                await self.run_boost_cycle()
                
                # Natural cycle timing - spread throughout the day
                base_wait = random.randint(900, 1800)  # 15-30 minutes base
                
                # Add time-of-day variance (more active during peak hours)
                current_hour = datetime.now().hour
                if 9 <= current_hour <= 11 or 15 <= current_hour <= 17 or 19 <= current_hour <= 21:
                    # Peak hours - slightly more frequent
                    wait_time = base_wait
                else:
                    # Off-peak - less frequent
                    wait_time = base_wait + random.randint(600, 1200)  # Add 10-20 minutes
                logger.info(f"😴 Sleeping for {wait_time//60} minutes...")
                await asyncio.sleep(wait_time)
                
            except KeyboardInterrupt:
                logger.info("🛑 Booster stopped by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

async def main():
    """Main function"""
    try:
        booster = TikTokViewBooster()
        await booster.start_booster()
    except KeyboardInterrupt:
        logger.info("🛑 Application stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}")

if __name__ == "__main__":
    asyncio.run(main())