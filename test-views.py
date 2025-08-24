#!/usr/bin/env python3
"""
Test script to simulate website video views
This will trigger the TikTok booster
"""

import mysql.connector
import random
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

def simulate_video_views():
    """Simulate some website video views"""
    db_config = {
        'host': os.getenv('DB_HOST'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'database': os.getenv('DB_NAME')
    }
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    # Get some TikTok videos
    cursor.execute("""
        SELECT id, title, tiktok_video_id 
        FROM tiktok_videos 
        WHERE share_url IS NOT NULL 
        LIMIT 5
    """)
    
    videos = cursor.fetchall()
    
    if not videos:
        print("❌ No TikTok videos found in database")
        return
    
    print(f"🎬 Found {len(videos)} videos to simulate views for")
    
    # Simulate views for random videos
    for _ in range(random.randint(3, 8)):
        video = random.choice(videos)
        
        # Insert fake view record
        cursor.execute("""
            INSERT INTO tiktok_video_views (
                video_id, ip_address, user_agent, 
                view_duration, view_percentage, device_type, viewed_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            video['id'],
            f"192.168.1.{random.randint(1, 254)}",
            "Mozilla/5.0 (test-bot)",
            random.randint(10, 60),
            random.randint(50, 100),
            "desktop",
            datetime.now()
        ))
        
        print(f"✅ Simulated view for: {video['title'][:30]}...")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("🎯 Simulation completed! TikTok booster should detect these views.")

if __name__ == "__main__":
    simulate_video_views()