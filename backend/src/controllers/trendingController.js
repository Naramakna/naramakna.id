const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

class TrendingController {
  
  /**
   * Get current trending topics from various sources and match with our articles
   */
  static async getTrendingTopics(req, res) {
    try {
      console.log('🔥 Getting trending topics');
      
      // Get cached trending topics first
      const cachedTopics = await TrendingController.getCachedTrendingTopics();
      
      if (cachedTopics && cachedTopics.length > 0) {
        res.json({
          success: true,
          data: {
            topics: cachedTopics,
            lastUpdated: new Date(),
            source: 'cache'
          }
        });
        return;
      }
      
      // If no cache, get fresh data (but this should be done by cronjob)
      const freshTopics = await TrendingController.scrapeTrendingTopics();
      
      res.json({
        success: true,
        data: {
          topics: freshTopics,
          lastUpdated: new Date(),
          source: 'fresh'
        }
      });
      
    } catch (error) {
      console.error('Error getting trending topics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending topics',
        error: error.message
      });
    }
  }

  /**
   * Update trending topics (called by cronjob)
   */
  static async updateTrendingTopics(req, res) {
    try {
      console.log('🔄 Updating trending topics via cronjob');
      
      const topics = await TrendingController.scrapeTrendingTopics();
      const matchedArticles = await TrendingController.matchArticlesWithTrending(topics);
      
      // Cache the results
      await TrendingController.cacheTrendingResults(matchedArticles);
      
      res.json({
        success: true,
        data: {
          topicsFound: topics.length,
          articlesMatched: matchedArticles.length,
          updatedAt: new Date()
        }
      });
      
    } catch (error) {
      console.error('Error updating trending topics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update trending topics',
        error: error.message
      });
    }
  }

  /**
   * Scrape trending topics from multiple sources (lightweight)
   */
  static async scrapeTrendingTopics() {
    const topics = [];
    
    try {
      // Method 1: Google Trends (public RSS - no API key needed)
      const googleTrends = await TrendingController.getGoogleTrendsIndonesia();
      topics.push(...googleTrends);
      
      // Method 2: News aggregator (lightweight scraping)
      const newsTopics = await TrendingController.getNewsAggregatorTopics();
      topics.push(...newsTopics);
      
      // Method 3: Social media hashtags (public data)
      const socialTopics = await TrendingController.getSocialMediaTrends();
      topics.push(...socialTopics);
      
    } catch (error) {
      console.error('Error scraping trending topics:', error);
    }
    
    // Remove duplicates and normalize
    let uniqueTopics = TrendingController.deduplicateTopics(topics);
    
    // Enhance with Gemini AI analysis
    try {
      uniqueTopics = await TrendingController.analyzeWithGeminiAI(uniqueTopics);
      console.log('🤖 Applied Gemini AI enhancement to trending topics');
    } catch (error) {
      console.warn('⚠️ Gemini AI enhancement failed, using original topics:', error.message);
    }
    
    // Final deduplication after AI enhancement
    uniqueTopics = TrendingController.deduplicateTopics(uniqueTopics);
    
    return uniqueTopics.slice(0, 100); // Limit to 100 topics
  }

  /**
   * Get trending from Google Trends Indonesia (RSS feed)
   */
  static async getGoogleTrendsIndonesia() {
    try {
      const response = await axios.get('https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID', {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBotIndonesia/1.0)'
        }
      });
      
      // Simple XML parsing for trending searches
      const trends = [];
      const xmlData = response.data;
      
      // Extract trending searches (basic regex parsing)
      const matches = xmlData.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g);
      
      if (matches) {
        matches.forEach(match => {
          const title = match.replace(/<title><!\[CDATA\[/, '').replace(/\]\]><\/title>/, '');
          if (title && title.length > 3 && !title.includes('Google Trends')) {
            trends.push({
              keyword: title.toLowerCase(),
              source: 'google_trends',
              weight: 10 // High weight for Google Trends
            });
          }
        });
      }
      
      return trends.slice(0, 20); // Top 20 from Google
      
    } catch (error) {
      console.error('Error fetching Google Trends:', error);
      return [];
    }
  }

  /**
   * Analyze trending topics using Gemini AI
   */
  static async analyzeWithGeminiAI(topics) {
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API key not found, skipping AI analysis');
        return topics;
      }

      // Prepare topics text for analysis
      const topicsText = topics.slice(0, 20).map(topic => 
        `${topic.keyword} (${topic.source}, weight: ${topic.weight})`
      ).join('\n');

      const prompt = `Analisis trending topics Indonesia berikut dan berikan rekomendasi kata kunci yang relevan untuk website berita naramakna.id:

${topicsText}

Berikan output dalam format JSON dengan struktur:
{
  "enhanced_keywords": [
    {"keyword": "kata_kunci", "relevance_score": 1-10, "category": "politik/ekonomi/teknologi/budaya/sport"},
    ...
  ],
  "recommendations": ["saran kata kunci tambahan yang relevan dengan audiens Indonesia"]
}

Fokus pada kata kunci yang:
1. Relevan untuk pembaca Indonesia  
2. Memiliki potensi traffik tinggi
3. Sesuai dengan konten website berita dan budaya`;

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          },
          timeout: 10000
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const geminiResponse = response.data.candidates[0].content.parts[0].text;
        
        // Try to extract JSON from Gemini response
        try {
          const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            
            // Enhance existing topics with AI analysis
            const enhancedTopics = [...topics];
            
            // Add AI-recommended keywords
            if (analysis.enhanced_keywords) {
              analysis.enhanced_keywords.forEach(ai_keyword => {
                enhancedTopics.push({
                  keyword: ai_keyword.keyword.toLowerCase(),
                  source: 'gemini_ai',
                  weight: Math.min(ai_keyword.relevance_score || 5, 10),
                  category: ai_keyword.category,
                  ai_enhanced: true
                });
              });
            }
            
            // Add recommendations as additional keywords
            if (analysis.recommendations) {
              analysis.recommendations.slice(0, 10).forEach(rec => {
                enhancedTopics.push({
                  keyword: rec.toLowerCase(),
                  source: 'gemini_recommendation', 
                  weight: 6,
                  ai_enhanced: true
                });
              });
            }
            
            console.log(`🤖 Gemini AI enhanced topics: +${enhancedTopics.length - topics.length} keywords`);
            return enhancedTopics;
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse Gemini AI response as JSON, using fallback');
        }
      }

      // Fallback: basic AI enhancement
      console.log('✨ Using Gemini AI basic enhancement');
      return topics.map(topic => ({
        ...topic,
        weight: Math.min(topic.weight + 2, 15) // Boost weight for AI-verified topics
      }));

    } catch (error) {
      console.error('❌ Gemini AI analysis failed:', error.message);
      return topics; // Return original topics if AI fails
    }
  }

  /**
   * Get trending topics from news aggregators
   */
  static async getNewsAggregatorTopics() {
    try {
      // Use public RSS feeds from major Indonesian news sites
      const newsSources = [
        'https://www.detik.com/terpopuler/feed/',
        'https://nasional.kompas.com/rss/',
        'https://www.cnnindonesia.com/nasional/rss'
      ];
      
      const topics = [];
      
      for (const source of newsSources) {
        try {
          const response = await axios.get(source, {
            timeout: 3000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NewsBotIndonesia/1.0)'
            }
          });
          
          // Extract keywords from news titles
          const matches = response.data.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g);
          
          if (matches) {
            matches.slice(0, 10).forEach(match => {
              const title = match.replace(/<title><!\[CDATA\[/, '').replace(/\]\]><\/title>/, '');
              const keywords = TrendingController.extractKeywordsFromTitle(title);
              
              keywords.forEach(keyword => {
                topics.push({
                  keyword: keyword.toLowerCase(),
                  source: 'news_aggregator',
                  weight: 5
                });
              });
            });
          }
          
        } catch (sourceError) {
          console.warn(`Error fetching from ${source}:`, sourceError.message);
          continue; // Skip this source and continue
        }
      }
      
      return topics;
      
    } catch (error) {
      console.error('Error fetching news aggregator topics:', error);
      return [];
    }
  }

  /**
   * Get social media trends (public hashtags)
   */
  static async getSocialMediaTrends() {
    // For now, return some common Indonesian trending topics
    // In the future, we can add actual social media scraping
    const commonTrends = [
      { keyword: 'politik indonesia', source: 'social_media', weight: 3 },
      { keyword: 'ekonomi nasional', source: 'social_media', weight: 3 },
      { keyword: 'teknologi', source: 'social_media', weight: 2 },
      { keyword: 'olahraga', source: 'social_media', weight: 2 },
      { keyword: 'entertainment', source: 'social_media', weight: 2 }
    ];
    
    return commonTrends;
  }

  /**
   * Extract keywords from news title
   */
  static extractKeywordsFromTitle(title) {
    if (!title || title.length < 5) return [];
    
    // Remove common stop words and extract meaningful terms
    const stopWords = ['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'oleh', 'dalam', 'akan', 'adalah', 'ini', 'itu', 'tidak', 'juga', 'atau', 'saat', 'serta', 'dapat', 'bisa', 'sudah', 'telah', 'bila', 'jika', 'karena', 'setelah', 'sebelum'];
    
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    // Return important multi-word phrases and single words
    const keywords = [];
    
    // Add significant single words
    words.forEach(word => {
      if (word.length > 4) {
        keywords.push(word);
      }
    });
    
    // Add 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 8) {
        keywords.push(phrase);
      }
    }
    
    return keywords.slice(0, 5); // Max 5 keywords per title
  }

  /**
   * Remove duplicate topics and normalize
   */
  static deduplicateTopics(topics) {
    const seen = new Map();
    
    topics.forEach(topic => {
      const normalized = topic.keyword.trim().toLowerCase();
      
      if (seen.has(normalized)) {
        // If duplicate, increase weight
        seen.get(normalized).weight += topic.weight;
      } else {
        seen.set(normalized, {
          keyword: normalized,
          source: topic.source,
          weight: topic.weight
        });
      }
    });
    
    // Sort by weight (descending)
    return Array.from(seen.values()).sort((a, b) => b.weight - a.weight);
  }

  /**
   * Match trending topics with our articles
   */
  static async matchArticlesWithTrending(trendingTopics) {
    try {
      const matchedArticles = [];
      
      for (const topic of trendingTopics) {
        const articles = await TrendingController.findArticlesByKeyword(topic.keyword);
        
        // Process articles with AI enhancement when available
        for (const article of articles) {
          const relevanceScore = topic.ai_enhanced ? 
            await TrendingController.analyzeArticleRelevance(article, topic) :
            TrendingController.calculateRelevanceScore(article, topic);
          
          matchedArticles.push({
            ...article,
            trending_keyword: topic.keyword,
            trending_weight: topic.weight,
            trending_source: topic.source,
            trending_category: topic.category,
            ai_enhanced: topic.ai_enhanced || false,
            relevance_score: relevanceScore
          });
        }
      }
      
      // Sort by relevance score and remove duplicates
      const uniqueArticles = new Map();
      
      matchedArticles.forEach(article => {
        const key = article.ID;
        if (!uniqueArticles.has(key) || uniqueArticles.get(key).relevance_score < article.relevance_score) {
          uniqueArticles.set(key, article);
        }
      });
      
      return Array.from(uniqueArticles.values())
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 20); // Top 20 trending articles
      
    } catch (error) {
      console.error('Error matching articles with trending:', error);
      return [];
    }
  }

  /**
   * Find articles by keyword (efficient search) with analytics view count
   */
  static async findArticlesByKeyword(keyword) {
    try {
      const query = `
        SELECT 
          p.ID,
          p.post_title,
          p.post_name,
          p.post_excerpt,
          p.post_date,
          p.view_count,
          u.display_name as author_name,
          attachment.guid as thumbnail_url
        FROM posts p
        LEFT JOIN users u ON p.post_author = u.ID
        LEFT JOIN postmeta thumb ON p.ID = thumb.post_id AND thumb.meta_key = '_thumbnail_id' AND thumb.meta_value REGEXP '^[0-9]+$'
        LEFT JOIN posts attachment ON thumb.meta_value = attachment.ID
        WHERE p.post_status = 'publish'
        AND p.post_type = 'post'
        AND (
          LOWER(p.post_title) LIKE LOWER(?)
          OR LOWER(p.post_content) LIKE LOWER(?)
          OR LOWER(p.post_excerpt) LIKE LOWER(?)
        )
        ORDER BY p.post_date DESC
        LIMIT 5
      `;
      
      const searchTerm = `%${keyword}%`;
      
      const articles = await sequelize.query(query, {
        replacements: [searchTerm, searchTerm, searchTerm],
        type: QueryTypes.SELECT
      });
      
      // Get analytics view counts for all articles (same as categoryController)
      const { Analytics } = require('../models');
      const postIds = articles.map(article => article.ID);
      
      // Get view counts from analytics table for batch processing
      const analyticsViewCounts = {};
      if (postIds.length > 0) {
        try {
          const analyticsData = await Analytics.findAll({
            attributes: [
              'content_id',
              [sequelize.fn('COUNT', sequelize.col('id')), 'view_count']
            ],
            where: {
              content_id: postIds,
              event_type: 'view'
            },
            group: ['content_id']
          });

          analyticsData.forEach(item => {
            analyticsViewCounts[item.content_id] = parseInt(item.dataValues.view_count) || 0;
          });
        } catch (error) {
          console.error('Error fetching analytics view counts:', error);
        }
      }

      // Update articles with analytics view counts
      const articlesWithAnalytics = articles.map(article => ({
        ...article,
        view_count: analyticsViewCounts[article.ID] || 0
      }));
      
      return articlesWithAnalytics;
      
    } catch (error) {
      console.error('Error finding articles by keyword:', error);
      return [];
    }
  }

  /**
   * Analyze article relevance using Gemini AI
   */
  static async analyzeArticleRelevance(article, topic) {
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY || !topic.ai_enhanced) {
        // Fall back to original scoring for non-AI topics
        return TrendingController.calculateRelevanceScore(article, topic);
      }

      const prompt = `Analisis relevansi artikel berita dengan trending topic:

ARTIKEL:
Judul: ${article.post_title}
Konten: ${article.post_excerpt || article.post_title}

TRENDING TOPIC: ${topic.keyword}
Kategori: ${topic.category || 'umum'}

Berikan skor relevansi 1-100 dan alasan singkat. Format:
{"relevance_score": 85, "reason": "alasan singkat"}`;

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          },
          timeout: 5000
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const geminiResponse = response.data.candidates[0].content.parts[0].text;
        
        try {
          const jsonMatch = geminiResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return Math.min(analysis.relevance_score || 50, 300); // Cap at 300 for AI-enhanced
          }
        } catch (parseError) {
          // Fallback if JSON parsing fails
        }
      }

      // Fallback to original calculation
      return TrendingController.calculateRelevanceScore(article, topic);

    } catch (error) {
      // Fallback to original calculation on error
      return TrendingController.calculateRelevanceScore(article, topic);
    }
  }

  /**
   * Calculate relevance score
   */
  static calculateRelevanceScore(article, topic) {
    let score = 0;
    
    // Base score from trending weight
    score += topic.weight * 10;
    
    // Boost for recent articles (last 7 days)
    const daysDiff = (new Date() - new Date(article.post_date)) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) {
      score += (7 - daysDiff) * 5;
    }
    
    // Boost for view count
    score += Math.min(article.view_count || 0, 1000) / 10;
    
    // Boost for keyword in title vs content
    const title = (article.post_title || '').toLowerCase();
    const keyword = topic.keyword.toLowerCase();
    
    if (title.includes(keyword)) {
      score += 50; // High boost for title match
    }
    
    return Math.round(score);
  }

  /**
   * Cache trending results
   */
  static async cacheTrendingResults(articles) {
    try {
      // Simple file-based cache (you can use Redis for better performance)
      const fs = require('fs').promises;
      const path = require('path');
      
      const cacheData = {
        articles,
        timestamp: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      const cacheDir = path.join(__dirname, '../cache');
      const cacheFile = path.join(cacheDir, 'trending_topics.json');
      
      // Ensure cache directory exists
      try {
        await fs.mkdir(cacheDir, { recursive: true });
      } catch (dirError) {
        // Directory might already exist
      }
      
      await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
      
      console.log('✅ Trending topics cached successfully');
      
    } catch (error) {
      console.error('Error caching trending results:', error);
    }
  }

  /**
   * Get cached trending topics
   */
  static async getCachedTrendingTopics() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const cacheFile = path.join(__dirname, '../cache/trending_topics.json');
      
      const data = await fs.readFile(cacheFile, 'utf8');
      const cache = JSON.parse(data);
      
      // Check if cache is still valid
      if (new Date() < new Date(cache.expires)) {
        // console.log('📦 Using cached trending topics');
        return cache.articles;
      } else {
        console.log('⏰ Cache expired, need fresh data');
        return null;
      }
      
    } catch (error) {
      console.log('📭 No valid cache found');
      return null;
    }
  }

  /**
   * Get trending articles for frontend
   */
  static async getTrendingArticles(req, res) {
    try {
      const { limit = 10, category } = req.query;
      
      // Get cached trending articles
      const cachedArticles = await TrendingController.getCachedTrendingTopics();
      
      let articles = cachedArticles || [];
      
      // Filter by category if specified
      if (category && articles.length > 0) {
        // Simple category filtering (you can improve this)
        articles = articles.filter(article => 
          (article.post_title || '').toLowerCase().includes(category.toLowerCase()) ||
          (article.trending_keyword || '').toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Limit results
      articles = articles.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        data: {
          posts: articles,
          totalItems: articles.length,
          criteria: 'trending_algorithm',
          lastUpdated: new Date()
        }
      });
      
    } catch (error) {
      console.error('Error getting trending articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending articles',
        error: error.message
      });
    }
  }
}

module.exports = TrendingController;