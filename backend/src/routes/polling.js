const express = require('express');
const router = express.Router();
const PollingController = require('../controllers/pollingController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes - no authentication required
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Polling routes working', timestamp: new Date().toISOString() });
});
router.get('/active', async (req, res) => {
  console.log('🟢 Async route handler called');
  console.log('🟢 req exists:', !!req);
  console.log('🟢 req.query:', req.query);
  
  try {
    const { limit = 10, offset = 0 } = req.query;
    console.log('🟢 Parsed params - limit:', limit, 'offset:', offset);
    
    // Use mysql2 directly for now to bypass sequelize issue
    const mysql = require('mysql2/promise');
    console.log('🟢 MySQL loaded');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    console.log('🟢 Database connected');
    
    // Get polls with options using JOIN
    const [pollsData] = await connection.query(`
      SELECT 
        p.id as poll_id,
        p.title as poll_title,
        p.category,
        p.total_votes,
        p.image_url,
        p.created_at,
        po.id as option_id,
        po.option_text,
        po.percentage,
        po.option_order
      FROM polls p
      LEFT JOIN poll_options po ON p.id = po.poll_id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC, po.option_order ASC
    `);
    
    console.log('🟢 Found joined data rows:', pollsData.length);
    if (pollsData.length > 0) {
      console.log('🟢 First row sample:', JSON.stringify(pollsData[0]));
    }
    
    // Group by poll_id
    const pollsMap = new Map();
    
    pollsData.forEach((row, index) => {
      console.log(`🟢 Processing row ${index}:`, row.poll_id, row.option_id, row.option_text);
      
      if (!pollsMap.has(row.poll_id)) {
        console.log('🟢 Creating new poll:', row.poll_id);
                   pollsMap.set(row.poll_id, {
             id: row.poll_id.toString(),
             title: row.poll_title,
             source: row.category || 'Umum',
             timeAgo: 'Baru saja',
             totalVotes: row.total_votes || 0,
             daysLeft: 7,
             date: new Date(row.created_at).toLocaleDateString('id-ID'),
             created_at: row.created_at,
             image_url: row.image_url,
             options: []
           });
      }
      
      // Add option if exists
      if (row.option_id) {
        console.log('🟢 Adding option to poll', row.poll_id, ':', row.option_text);
        pollsMap.get(row.poll_id).options.push({
          id: row.option_id.toString(),
          text: row.option_text,
          percentage: row.percentage || 0
        });
      }
    });
    
    console.log('🟢 PollsMap size:', pollsMap.size);
    console.log('🟢 PollsMap keys:', Array.from(pollsMap.keys()));
    
    // Debug first poll
    const firstPoll = pollsMap.get(1);
    if (firstPoll) {
      console.log('🟢 First poll options count:', firstPoll.options.length);
      console.log('🟢 First poll options:', JSON.stringify(firstPoll.options));
    }
    
    // Convert Map to Array and maintain order by created_at DESC
    const pollsWithOptions = Array.from(pollsMap.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, parseInt(limit));
    console.log('🟢 Processed polls with options:', pollsWithOptions.length);
    console.log('🟢 Final result first poll options:', pollsWithOptions[0]?.options?.length);
    
    await connection.end();
    console.log('🟢 Query executed, found polls with options:', pollsWithOptions.length);
    
    const polls = pollsWithOptions;

    console.log('🟢 Query executed, found polls:', polls.length);
    
    res.json({
      success: true,
      data: {
        polls: polls, // Use polls directly - already formatted
        pagination: { total: polls.length, page: 1, limit: parseInt(limit), totalPages: 1 }
      },
      message: `Found ${polls.length} active polls`
    });
  } catch (error) {
    console.error('🔴 Error in async route:', error);
    res.status(500).json({
      success: false,
      message: 'Error in async route',
      error: error.message
    });
  }
});
router.post('/vote', async (req, res) => {
  try {
    console.log('🗳️ Vote request received:', req.body);
    const { poll_id, option_id, user_id } = req.body;
    
    if (!poll_id || !option_id) {
      return res.status(400).json({
        success: false,
        message: 'poll_id and option_id are required'
      });
    }
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    // Check if user already voted for this poll (session/IP based check - NO LOGIN REQUIRED)
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';
    const sessionId = user_id || `${clientIp}_${Buffer.from(userAgent).toString('base64').slice(0, 10)}`;
    
    // Use IP address + browser fingerprint to prevent spam (no login needed)
    const [existingVotes] = await connection.query(
      `SELECT id FROM poll_votes WHERE poll_id = ? AND ip_address = ?`,
      [poll_id, sessionId]
    );
    
    if (existingVotes.length > 0) {
      await connection.end();
      return res.status(409).json({
        success: false,
        message: 'You have already voted for this poll'
      });
    }
    
    // Record the vote in poll_votes table (prevent duplicate voting)
    await connection.query(
      `INSERT INTO poll_votes (poll_id, option_id, ip_address, voted_at) VALUES (?, ?, ?, NOW())`,
      [poll_id, option_id, sessionId]
    );
    
    // Update vote count for the option
    await connection.query(
      `UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ? AND poll_id = ?`,
      [option_id, poll_id]
    );
    
    // Update total votes for poll
    await connection.query(
      `UPDATE polls SET total_votes = total_votes + 1 WHERE id = ?`,
      [poll_id]
    );
    
    // Recalculate percentages
    const [pollData] = await connection.query(
      `SELECT total_votes FROM polls WHERE id = ?`,
      [poll_id]
    );
    
    if (pollData.length > 0) {
      const totalVotes = pollData[0].total_votes;
      await connection.query(
        `UPDATE poll_options 
         SET percentage = ROUND((vote_count / ?) * 100, 2)
         WHERE poll_id = ?`,
        [totalVotes, poll_id]
      );
    }
    
    await connection.end();
    
    console.log('🗳️ Vote recorded successfully');
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        poll_id: poll_id,
        option_id: option_id,
        session_id: sessionId
      }
    });
  } catch (error) {
    console.error('🔴 Error recording vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
});
// Admin routes for poll management
router.get('/trending-candidates', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    // Get trending posts using direct SQL
    const [trendingPosts] = await connection.query(`
      SELECT 
        p.ID,
        p.post_title,
        p.post_content,
        p.post_excerpt,
        p.post_date,
        p.view_count,
        p.comment_count,
        (p.view_count * 0.7 + p.comment_count * 0.3) as trending_score,
        GROUP_CONCAT(DISTINCT t.name) as categories
      FROM posts p
      LEFT JOIN term_relationships tr ON p.ID = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
      LEFT JOIN terms t ON tt.term_id = t.term_id
      WHERE p.post_status = 'publish' 
      AND p.post_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY p.ID, p.post_title, p.post_content, p.post_excerpt, p.post_date, p.view_count, p.comment_count
      HAVING trending_score > 50
      ORDER BY trending_score DESC
      LIMIT ${parseInt(limit)}
    `);
    
    await connection.end();
    
    res.json({ 
      success: true, 
      data: trendingPosts,
      message: `Found ${trendingPosts.length} trending candidates`
    });
  } catch (error) {
    console.error('Error getting trending candidates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get trending candidates', 
      error: error.message 
    });
  }
});
router.post('/create', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { title, question, category, expires_at, source_article_id, options } = req.body;
    
    if (!title || !question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Title, question, and at least 2 options are required'
      });
    }
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    // Get article details if source_article_id is provided
    let imageUrl = null;
    if (source_article_id) {
      const [articleData] = await connection.query(
        `SELECT post_content, post_excerpt FROM posts WHERE ID = ?`,
        [source_article_id]
      );
      
      if (articleData.length > 0) {
        // Extract first image from post content
        const content = articleData[0].post_content;
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }
    }

    // Insert poll
    const [pollResult] = await connection.query(
      `INSERT INTO polls (title, question, category, status, source_article_id, image_url, expires_at, created_by, created_at) 
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, NOW())`,
      [title, question, category || null, source_article_id || null, imageUrl, expires_at || null, req.user.id]
    );
    
    const pollId = pollResult.insertId;
    
    // Insert poll options
    for (let i = 0; i < options.length; i++) {
      await connection.query(
        `INSERT INTO poll_options (poll_id, option_text, option_order, vote_count, percentage) 
         VALUES (?, ?, ?, 0, 0)`,
        [pollId, options[i].option_text, options[i].option_order || i + 1]
      );
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Poll created successfully',
      data: { poll_id: pollId }
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll',
      error: error.message
    });
  }
});

// Generate poll from trending post
router.post('/generate', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { source_article_id, title, category } = req.body;
    
    if (!source_article_id || !title) {
      return res.status(400).json({
        success: false,
        message: 'Source article ID and title are required'
      });
    }
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    // Generate poll question and options based on article
    const question = `What do you think about: ${title}?`;
    const options = [
      { option_text: 'Sangat Setuju', option_order: 1 },
      { option_text: 'Setuju', option_order: 2 },
      { option_text: 'Netral', option_order: 3 },
      { option_text: 'Tidak Setuju', option_order: 4 },
      { option_text: 'Sangat Tidak Setuju', option_order: 5 }
    ];
    
    // Get article details for image
    let imageUrl = null;
    const [articleData] = await connection.query(
      `SELECT post_content, post_excerpt FROM posts WHERE ID = ?`,
      [source_article_id]
    );
    
    if (articleData.length > 0) {
      // Extract first image from post content
      const content = articleData[0].post_content;
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }
    
    // Insert poll
    const [pollResult] = await connection.query(
      `INSERT INTO polls (title, question, category, status, source_article_id, image_url, generation_method, created_by, created_at) 
       VALUES (?, ?, ?, 'active', ?, ?, 'template', ?, NOW())`,
      [title, question, category || 'General', source_article_id, imageUrl, req.user.id]
    );
    
    const pollId = pollResult.insertId;
    
    // Insert poll options
    for (const option of options) {
      await connection.query(
        `INSERT INTO poll_options (poll_id, option_text, option_order, vote_count, percentage) 
         VALUES (?, ?, ?, 0, 0)`,
        [pollId, option.option_text, option.option_order]
      );
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Poll generated successfully from trending post',
      data: { poll_id: pollId }
    });
  } catch (error) {
    console.error('Error generating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate poll',
      error: error.message
    });
  }
});

// Get all polls for admin (with full details)
router.get('/admin/all', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    // Get all polls with full details
    const [pollsData] = await connection.query(`
      SELECT 
        p.id,
        p.title,
        p.question,
        p.category,
        p.status,
        p.total_votes,
        p.view_count,
        p.created_at,
        p.expires_at,
        p.source_article_id,
        p.image_url,
        p.generation_method,
        p.created_by,
        COUNT(po.id) as option_count
      FROM polls p
      LEFT JOIN poll_options po ON p.id = po.poll_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `);
    
    // Get options for each poll
    for (let poll of pollsData) {
      const [options] = await connection.query(`
        SELECT id, option_text, option_order, vote_count, percentage
        FROM poll_options 
        WHERE poll_id = ? 
        ORDER BY option_order
      `, [poll.id]);
      
      poll.options = options;
    }
    
    await connection.end();
    
    res.json({
      success: true,
      data: pollsData,
      message: `Found ${pollsData.length} polls`
    });
  } catch (error) {
    console.error('Error getting admin polls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get polls',
      error: error.message
    });
  }
});

// Close poll
router.put('/:pollId/close', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'naramakna_clean'
    });
    
    await connection.query(
      `UPDATE polls SET status = 'closed' WHERE id = ?`,
      [pollId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Poll closed successfully'
    });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close poll',
      error: error.message
    });
  }
});

module.exports = router;
