const { sequelize } = require('./src/models');

async function cleanupCategories() {
  try {
    console.log('🧹 Cleaning up categories and tags...');
    
    // Define which categories should remain as categories
    const allowedCategorySlugs = [
      'narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola', 
      'cerita-rasa', 'akal-budi', 'horison', 'dunia',
      'pendidikan', 'budaya', 'teknologi',
      'uncategorized' // Keep default WordPress category
    ];
    
    // Get all current categories
    const currentCategories = await sequelize.query(`
      SELECT t.term_id, t.name, t.slug, tt.term_taxonomy_id
      FROM terms t 
      JOIN term_taxonomy tt ON t.term_id = tt.term_id 
      WHERE tt.taxonomy = 'category'
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`📂 Found ${currentCategories.length} categories`);
    
    // Find categories that should be moved to tags
    const categoriesToMove = currentCategories.filter(cat => 
      !allowedCategorySlugs.includes(cat.slug)
    );
    
    console.log(`🏷️ Moving ${categoriesToMove.length} categories to tags:`);
    categoriesToMove.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });
    
    // Move them to post_tag taxonomy
    for (const cat of categoriesToMove) {
      try {
        // Update taxonomy from 'category' to 'post_tag'
        await sequelize.query(`
          UPDATE term_taxonomy 
          SET taxonomy = 'post_tag', parent = 0
          WHERE term_taxonomy_id = ?
        `, {
          replacements: [cat.term_taxonomy_id],
          type: sequelize.QueryTypes.UPDATE
        });
        
        console.log(`✅ Moved "${cat.name}" to tags`);
      } catch (error) {
        console.error(`❌ Failed to move "${cat.name}":`, error.message);
      }
    }
    
    // Show final result
    const finalCategories = await sequelize.query(`
      SELECT t.term_id, t.name, t.slug, tt.parent
      FROM terms t 
      JOIN term_taxonomy tt ON t.term_id = tt.term_id 
      WHERE tt.taxonomy = 'category'
      ORDER BY tt.parent, t.name
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`\n📁 Final Categories (${finalCategories.length} items):`);
    finalCategories.forEach(cat => {
      const indent = cat.parent === 0 ? '' : '  └─ ';
      console.log(`${indent}${cat.name} (ID: ${cat.term_id}, slug: ${cat.slug})`);
    });
    
    console.log('\n✨ Category cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupCategories();
