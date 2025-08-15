const { sequelize } = require('./src/models');

async function analyzeTaxonomy() {
  try {
    console.log('📊 Analyzing taxonomy structure...');
    
    // Check categories vs tags
    const taxonomies = await sequelize.query(`
      SELECT 
        tt.taxonomy,
        COUNT(*) as count
      FROM term_taxonomy tt
      GROUP BY tt.taxonomy
      ORDER BY count DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('📂 Taxonomy breakdown:');
    taxonomies.forEach(tax => {
      console.log(`- ${tax.taxonomy}: ${tax.count} items`);
    });
    
    // Show current categories
    const categories = await sequelize.query(`
      SELECT t.term_id, t.name, t.slug, tt.parent
      FROM terms t 
      JOIN term_taxonomy tt ON t.term_id = tt.term_id 
      WHERE tt.taxonomy = 'category'
      ORDER BY tt.parent, t.name
      LIMIT 20
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('\n📁 Current Categories (sample):');
    categories.forEach(cat => {
      const indent = cat.parent === 0 ? '' : '  └─ ';
      console.log(`${indent}${cat.name} (ID: ${cat.term_id}, slug: ${cat.slug})`);
    });
    
    // Show tags if any
    const tags = await sequelize.query(`
      SELECT t.term_id, t.name, t.slug
      FROM terms t 
      JOIN term_taxonomy tt ON t.term_id = tt.term_id 
      WHERE tt.taxonomy = 'post_tag'
      ORDER BY t.name
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('\n🏷️ Current Tags (sample):');
    if (tags.length > 0) {
      tags.forEach(tag => {
        console.log(`- ${tag.name} (ID: ${tag.term_id}, slug: ${tag.slug})`);
      });
    } else {
      console.log('- No post_tag taxonomy found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

analyzeTaxonomy();
