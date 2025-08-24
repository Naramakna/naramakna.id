#!/usr/bin/env python3
"""
Test TikTok booster with one cycle only
"""

import asyncio
import sys
import os
import importlib.util

# Load the tiktok-booster module
spec = importlib.util.spec_from_file_location("tiktok_booster", "/var/www/naramakna.id/tiktok-booster.py")
tiktok_booster = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tiktok_booster)

TikTokViewBooster = tiktok_booster.TikTokViewBooster
import logging

# Configure logging for test
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

async def test_one_cycle():
    """Test one boost cycle"""
    booster = TikTokViewBooster()
    print("🧪 Testing TikTok View Booster - One Cycle")
    print("=" * 50)
    
    await booster.run_boost_cycle()
    
    print("=" * 50)
    print("✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(test_one_cycle())