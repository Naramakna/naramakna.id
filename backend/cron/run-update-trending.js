require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const axios = require("axios");
const RedisLock = require("../src/services/redisLock");

async function updateTrending() {
  const lockKey = 'cron:update-trending';
  const lockValue = await RedisLock.acquire(lockKey, 300); // 5 min lock (heavy operation)

  if (!lockValue) {
    console.log("⏭️  Another instance is already updating trending, skipping...");
    process.exit(0);
  }

  try {
    console.log("🔥 Updating trending topics...");

    const response = await axios.post(
      "http://localhost:3001/api/trending/update",
      {},
      { timeout: 60000 }
    );

    if (response.data.success) {
      const wibTime = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      console.log(`✅ [${wibTime}] Trending updated: ${JSON.stringify(response.data.data)}`);
    } else {
      console.error("❌ Update failed:", response.data);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await RedisLock.release(lockKey, lockValue);
  }
}

updateTrending();
