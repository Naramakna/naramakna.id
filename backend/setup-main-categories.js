const { sequelize } = require('./src/models');

async function setupMainCategories() {
  try {
    console.log('🗂️ Setting up main categories...');

    // Main categories yang akan dibuat
    const mainCategories = [
      { name: 'Narapandang', slug: 'narapandang' },
      { name: 'Pelakon', slug: 'pelakon' },
      { name: 'Laga & Gaya', slug: 'laga-gaya' },
      { name: 'Wahana', slug: 'wahana' },
      { name: 'Olah Bola', slug: 'olah-bola' },
      { name: 'Cerita Rasa', slug: 'cerita-rasa' },
      { name: 'Akal Budi', slug: 'akal-budi' },
      { name: 'Horison', slug: 'horison' },
      { name: 'Dunia', slug: 'dunia' }
    ];

    // Sub-categories untuk Akal Budi
    const subCategories = [
      { name: 'Pendidikan', slug: 'pendidikan', parent: 'akal-budi' },
      { name: 'Budaya', slug: 'budaya', parent: 'akal-budi' },
      { name: 'Teknologi', slug: 'teknologi', parent: 'akal-budi' }
    ];

    // Buat main categories
    for (const category of mainCategories) {
      try {
        // Check if category already exists
        const existingCategory = await sequelize.query(
          'SELECT term_id FROM terms WHERE slug = ?',
          {
            replacements: [category.slug],
            type: sequelize.QueryTypes.SELECT
          }
        );

        let termId;
        if (existingCategory.length > 0) {
          termId = existingCategory[0].term_id;
          console.log(`✅ Category "${category.name}" already exists (ID: ${termId})`);
        } else {
          // Insert into terms table
          const [result] = await sequelize.query(
            'INSERT INTO terms (name, slug, term_group) VALUES (?, ?, 0)',
            {
              replacements: [category.name, category.slug],
              type: sequelize.QueryTypes.INSERT
            }
          );
          termId = result;

          // Insert into term_taxonomy table
          await sequelize.query(
            'INSERT INTO term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (?, "category", "", 0, 0)',
            {
              replacements: [termId],
              type: sequelize.QueryTypes.INSERT
            }
          );

          console.log(`✅ Created main category: "${category.name}" (ID: ${termId})`);
        }
      } catch (error) {
        console.error(`❌ Error creating category "${category.name}":`, error.message);
      }
    }

    // Buat sub-categories
    for (const subCategory of subCategories) {
      try {
        // Get parent category ID
        const parentCategory = await sequelize.query(
          'SELECT term_id FROM terms WHERE slug = ?',
          {
            replacements: [subCategory.parent],
            type: sequelize.QueryTypes.SELECT
          }
        );

        if (parentCategory.length === 0) {
          console.error(`❌ Parent category "${subCategory.parent}" not found for "${subCategory.name}"`);
          continue;
        }

        const parentId = parentCategory[0].term_id;

        // Check if subcategory already exists
        const existingSubCategory = await sequelize.query(
          'SELECT term_id FROM terms WHERE slug = ?',
          {
            replacements: [subCategory.slug],
            type: sequelize.QueryTypes.SELECT
          }
        );

        let termId;
        if (existingSubCategory.length > 0) {
          termId = existingSubCategory[0].term_id;
          console.log(`✅ Sub-category "${subCategory.name}" already exists (ID: ${termId})`);
        } else {
          // Insert into terms table
          const [result] = await sequelize.query(
            'INSERT INTO terms (name, slug, term_group) VALUES (?, ?, 0)',
            {
              replacements: [subCategory.name, subCategory.slug],
              type: sequelize.QueryTypes.INSERT
            }
          );
          termId = result;

          // Insert into term_taxonomy table with parent
          await sequelize.query(
            'INSERT INTO term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (?, "category", "", ?, 0)',
            {
              replacements: [termId, parentId],
              type: sequelize.QueryTypes.INSERT
            }
          );

          console.log(`✅ Created sub-category: "${subCategory.name}" under "${subCategory.parent}" (ID: ${termId})`);
        }
      } catch (error) {
        console.error(`❌ Error creating sub-category "${subCategory.name}":`, error.message);
      }
    }

    console.log('\n🎉 Main categories setup completed!');
    
    // Show final structure
    const finalCategories = await sequelize.query(`
      SELECT 
        t.term_id, 
        t.name, 
        t.slug, 
        tt.parent,
        CASE WHEN tt.parent = 0 THEN 'Main Category' ELSE 'Sub Category' END as type
      FROM terms t 
      JOIN term_taxonomy tt ON t.term_id = tt.term_id 
      WHERE tt.taxonomy = 'category' 
      AND (t.slug IN ('narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola', 'cerita-rasa', 'akal-budi', 'horison', 'dunia', 'pendidikan', 'budaya', 'teknologi'))
      ORDER BY tt.parent, t.name
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('\n📊 Final Category Structure:');
    finalCategories.forEach(cat => {
      const indent = cat.parent === 0 ? '' : '  └─ ';
      console.log(`${indent}${cat.name} (${cat.slug}) - ${cat.type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupMainCategories();
