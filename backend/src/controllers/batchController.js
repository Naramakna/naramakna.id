/**
 * Batch Request Controller
 * 
 * Allows frontend to batch multiple API requests into a single HTTP call
 * This reduces connection overhead and allows backend to process efficiently
 * 
 * Usage (Frontend):
 * POST /api/batch
 * {
 *   "requests": [
 *     { "method": "GET", "url": "/api/settings/public" },
 *     { "method": "GET", "url": "/api/content/categories?limit=50" }
 *   ]
 * }
 */

const axios = require("axios");

class BatchController {
  static async processBatch(req, res) {
    try {
      const { requests } = req.body;

      if (!requests || !Array.isArray(requests)) {
        return res.status(400).json({
          success: false,
          error: "Invalid request format. Expected { requests: [...] }"
        });
      }

      if (requests.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No requests provided"
        });
      }

      if (requests.length > 50) {
        return res.status(400).json({
          success: false,
          error: "Too many requests. Maximum 50 requests per batch"
        });
      }

      const baseUrl = "http://localhost:" + (process.env.PORT || 3001);
      const startTime = Date.now();

      // Process all requests in parallel
      const responses = await Promise.all(
        requests.map(async (request, index) => {
          try {
            const { method = "GET", url, headers = {}, data } = request;

            // Validate URL
            if (!url || !url.startsWith("/api/")) {
              return {
                index,
                status: 400,
                error: "Invalid URL. Must start with /api/"
              };
            }

            // Make internal request
            const response = await axios({
              method,
              url: baseUrl + url,
              headers: {
                ...headers,
                "x-forwarded-for": req.ip,
                "x-batch-request": "true"
              },
              data,
              timeout: 30000, // 30 second timeout per request
              validateStatus: () => true // Do not throw on any status
            });

            return {
              index,
              status: response.status,
              data: response.data
            };
          } catch (error) {
            return {
              index,
              status: 500,
              error: error.message
            };
          }
        })
      );

      const duration = Date.now() - startTime;

      console.log("📦 Batch request processed: " + requests.length + " requests in " + duration + "ms");

      res.json({
        success: true,
        responses,
        meta: {
          total: requests.length,
          duration: duration + "ms"
        }
      });
    } catch (error) {
      console.error("❌ Batch request error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process batch request"
      });
    }
  }
}

module.exports = BatchController;
