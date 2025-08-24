#!/usr/bin/env python3
"""
Intensive TikTok Boost for Specific Video
Simulate multiple website views and immediate boost
"""

import asyncio
import aiohttp
import mysql.connector
import random
import time
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

async def intensive_boost_video():
    """Intensive boost for ketawaologi video"""
    
    # Database config
    db_config = {
        'host': os.getenv('DB_HOST'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'database': os.getenv('DB_NAME')
    }
    
    # Get ketawaologi video
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT id, tiktok_video_id, title, share_url, tiktok_view_count 
        FROM tiktok_videos 
        WHERE tiktok_video_id = '7540926473776024850'
        LIMIT 1
    """)
    
    video = cursor.fetchone()
    if not video:
        print("❌ Video tidak ditemukan")
        return
        
    print(f"🎯 Target Video: {video['title'][:50]}...")
    print(f"🔗 Share URL: {video['share_url']}")
    print(f"📊 Current Views: {video['tiktok_view_count']}")
    print("=" * 60)
    
    # Step 1: Simulate banyak website views
    print("🔥 Step 1: Simulating intensive website views...")
    
    for i in range(15):  # 15 fake views
        cursor.execute("""
            INSERT INTO tiktok_video_views (
                video_id, ip_address, user_agent, 
                view_duration, view_percentage, device_type, viewed_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            video['id'],
            f"192.168.1.{random.randint(1, 254)}",
            random.choice([
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
                "Mozilla/5.0 (Android 12; Mobile; rv:108.0) Gecko/108.0 Firefox/108.0",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            ]),
            random.randint(30, 120),  # view duration 30-120 seconds
            random.randint(70, 100),  # view percentage 70-100%
            random.choice(["mobile", "desktop", "tablet"]),
            datetime.now() - timedelta(seconds=random.randint(1, 300))  # spread over last 5 minutes
        ))
        
        print(f"✅ Simulated view {i+1}/15")
    
    conn.commit()
    print(f"🎬 Generated 15 website views for intensive boost!")
    
    # Step 2: Direct intensive TikTok boost
    print("\n🚀 Step 2: Direct intensive TikTok boost...")
    
    user_agents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/117.0 Firefox/117.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    ]
    
    referrers = [
        'https://www.google.com/search?q=ketawaologi',
        'https://www.facebook.com/',
        'https://twitter.com/naramakna',
        'https://naramakna.id/',
        'https://www.instagram.com/',
        None  # Direct access
    ]
    
    successful_boosts = 0
    
    connector = aiohttp.TCPConnector(limit=10)
    timeout = aiohttp.ClientTimeout(total=20)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        
        for i in range(25):  # 25 intensive boosts
            try:
                # Random delay
                await asyncio.sleep(random.uniform(3, 10))
                
                headers = {
                    'User-Agent': random.choice(user_agents),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5,id;q=0.3',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0'
                }
                
                referrer = random.choice(referrers)
                if referrer:
                    headers['Referer'] = referrer
                
                async with session.get(
                    video['share_url'],
                    headers=headers,
                    allow_redirects=True
                ) as response:
                    if response.status == 200:
                        successful_boosts += 1
                        print(f"✅ Intensive boost {i+1}/25 successful (Total: {successful_boosts})")
                        
                        # Random chance to "engage" more
                        if random.random() < 0.3:  # 30% chance
                            await asyncio.sleep(random.uniform(5, 15))  # Stay longer
                            print(f"💡 Extended engagement for boost {i+1}")
                    else:
                        print(f"⚠️ Boost {i+1} failed: HTTP {response.status}")
                        
            except Exception as e:
                print(f"❌ Boost {i+1} error: {e}")
    
    cursor.close()
    conn.close()
    
    print("=" * 60)
    print(f"🏆 INTENSIVE BOOST COMPLETED!")
    print(f"📈 Successful TikTok hits: {successful_boosts}/25")
    print(f"🎬 Website views generated: 15")
    print(f"⏰ Wait 10-15 minutes for TikTok view count update")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(intensive_boost_video())