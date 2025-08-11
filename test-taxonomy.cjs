const { QueryTypes } = require('sequelize');
const { sequelize } = require('./backend/src/models');

/**
 * Test function to add terms from post fields
 */
async function addTermsFromPost(postId, { channel, topic, keyword }) {
  try {
    console.log(`🏷️ Adding terms from post ${postId}: channel="${channel}", topic="${topic}", keyword="${keyword}"`);

    const termsToAdd = [];

    // Add channel as category
    if (channel) {
      termsToAdd.push({ name: channel, taxonomy: 'category' });
    }

    // Add topic as newstopic
    if (topic) {
      termsToAdd.push({ name: topic, taxonomy: 'newstopic' });
    }

    // Add keywords as tags (split by comma)
    if (keyword) {
      const keywords = keyword.split(',').map(k => k.trim()).filter(k => k);
      keywords.forEach(kw => {
        termsToAdd.push({ name: kw, taxonomy: 'post_tag' });
      });
    }

    const addedTerms = [];

    for (const termData of termsToAdd) {
      try {
        // Check if term already exists
        const existingTermQuery = `
          SELECT t.term_id, tt.term_taxonomy_id 
          FROM terms t 
          JOIN term_taxonomy tt ON t.term_id = tt.term_id 
          WHERE t.name = ? AND tt.taxonomy = ?
        `;
        
        const existingTerm = await sequelize.query(existingTermQuery, {
          replacements: [termData.name, termData.taxonomy],
          type: QueryTypes.SELECT
        });

        let termTaxonomyId;

        if (existingTerm.length > 0) {
          // Term exists, use existing term_taxonomy_id
          termTaxonomyId = existingTerm[0].term_taxonomy_id;
          console.log(`✅ Using existing term: ${termData.name} (${termData.taxonomy})`);
        } else {
          // Create new term
          const slug = termData.name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');

          // Insert into terms table
          const insertTermQuery = `
            INSERT INTO terms (name, slug, term_group) 
            VALUES (?, ?, 0)
          `;
          
          const termResult = await sequelize.query(insertTermQuery, {
            replacements: [termData.name, slug],
            type: QueryTypes.INSERT
          });

          const termId = termResult[0];

          // Insert into term_taxonomy table
          const insertTaxonomyQuery = `
            INSERT INTO term_taxonomy (term_id, taxonomy, description, parent, count) 
            VALUES (?, ?, '', 0, 0)
          `;
          
          const taxonomyResult = await sequelize.query(insertTaxonomyQuery, {
            replacements: [termId, termData.taxonomy],
            type: QueryTypes.INSERT
          });

          termTaxonomyId = taxonomyResult[0];
          console.log(`🆕 Created new term: ${termData.name} (${termData.taxonomy})`);
        }

        // Check if relationship already exists
        const existingRelQuery = `
          SELECT * FROM term_relationships 
          WHERE object_id = ? AND term_taxonomy_id = ?
        `;
        
        const existingRel = await sequelize.query(existingRelQuery, {
          replacements: [postId, termTaxonomyId],
          type: QueryTypes.SELECT
        });

        if (existingRel.length === 0) {
          // Create term relationship
          const insertRelQuery = `
            INSERT INTO term_relationships (object_id, term_taxonomy_id, term_order) 
            VALUES (?, ?, 0)
          `;
          
          await sequelize.query(insertRelQuery, {
            replacements: [postId, termTaxonomyId],
            type: QueryTypes.INSERT
          });

          // Update count
          const updateCountQuery = `
            UPDATE term_taxonomy 
            SET count = count + 1 
            WHERE term_taxonomy_id = ?
          `;
          
          await sequelize.query(updateCountQuery, {
            replacements: [termTaxonomyId],
            type: QueryTypes.UPDATE
          });

          addedTerms.push(termData);
          console.log(`🔗 Linked post ${postId} to term: ${termData.name}`);
        } else {
          console.log(`⚠️ Relationship already exists for post ${postId} and term: ${termData.name}`);
        }

      } catch (termError) {
        console.error(`❌ Error processing term ${termData.name}:`, termError);
      }
    }

    console.log(`✅ Successfully processed ${addedTerms.length} terms for post ${postId}`);
    return addedTerms;

  } catch (error) {
    console.error('❌ Error in addTermsFromPost:', error);
    throw error;
  }
}

// Test the function
async function testTaxonomy() {
  try {
    console.log('🚀 Testing taxonomy system...');
    
    // Test with post ID 3239 and anime tags
    const result = await addTermsFromPost(3239, {
      channel: 'Entertainment',
      topic: 'Anime', 
      keyword: 'naruto,boruto,anime'
    });
    
    console.log('🎉 Test completed! Added terms:', result);
    
    // Verify the tags were created
    const checkQuery = `
      SELECT t.name, t.slug, tt.taxonomy, tt.count 
      FROM terms t 
      JOIN term_taxonomy tt ON t.term_id = tt.term_id 
      WHERE t.name IN ('naruto', 'boruto', 'anime', 'Entertainment', 'Anime')
      ORDER BY tt.taxonomy, t.name
    `;
    
    const createdTerms = await sequelize.query(checkQuery, {
      type: QueryTypes.SELECT
    });
    
    console.log('📊 Created/Updated terms:');
    console.table(createdTerms);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testTaxonomy();
