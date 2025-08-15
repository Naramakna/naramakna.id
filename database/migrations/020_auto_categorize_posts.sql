-- Auto-categorize existing posts based on their tags/terms
-- This will help group the thousands of existing tags into our 9 main categories

-- Create a temporary table for tag-to-category mapping
CREATE TEMPORARY TABLE tag_category_mapping (
    tag_pattern VARCHAR(255),
    new_category_slug VARCHAR(100),
    pattern_type ENUM('exact', 'contains', 'starts_with', 'ends_with') DEFAULT 'contains'
);

-- Insert mapping patterns for each category
-- 1. NARAPANDANG - Kolom Reputasi dan Komunikasi (politik, sosial, komunikasi, reputasi)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('komunikasi', 'narapandang', 'contains'),
('reputasi', 'narapandang', 'contains'),
('politik', 'narapandang', 'contains'),
('sosial', 'narapandang', 'contains'),
('nasionalisme', 'narapandang', 'contains'),
('kemerdekaan', 'narapandang', 'contains'),
('analisis-politik', 'narapandang', 'exact'),
('budaya-digital', 'narapandang', 'contains'),
('generasi-muda', 'narapandang', 'contains'),
('anak-', 'narapandang', 'starts_with'),
('generasi', 'narapandang', 'contains'),
('indonesia', 'narapandang', 'contains'),
('masyarakat', 'narapandang', 'contains'),
('sosial', 'narapandang', 'contains');

-- 2. PELAKON - Hiburan dan tokoh (entertainment, artis, tokoh, hiburan)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('hiburan', 'pelakon', 'contains'),
('entertainment', 'pelakon', 'contains'),
('budaya-pop', 'pelakon', 'exact'),
('budaya-populer', 'pelakon', 'exact'),
('anime', 'pelakon', 'contains'),
('musik', 'pelakon', 'contains'),
('artis', 'pelakon', 'contains'),
('tokoh', 'pelakon', 'contains'),
('selebriti', 'pelakon', 'contains'),
('film', 'pelakon', 'contains'),
('drama', 'pelakon', 'contains');

-- 3. LAGA & GAYA - Lifestyle (fashion, gaya hidup, trend, style)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('gaya-hidup', 'laga-gaya', 'exact'),
('lifestyle', 'laga-gaya', 'contains'),
('fashion', 'laga-gaya', 'contains'),
('style', 'laga-gaya', 'contains'),
('trend', 'laga-gaya', 'contains'),
('pakaian', 'laga-gaya', 'contains'),
('sepatu', 'laga-gaya', 'contains'),
('alas-kaki', 'laga-gaya', 'exact'),
('genderless-fashion', 'laga-gaya', 'exact'),
('converse', 'laga-gaya', 'exact'),
('kalcer', 'laga-gaya', 'contains'),
('identitas', 'laga-gaya', 'contains');

-- 4. WAHANA - Otomotif (mobil, motor, transportasi, otomotif)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('otomotif', 'wahana', 'contains'),
('mobil', 'wahana', 'contains'),
('motor', 'wahana', 'contains'),
('kendaraan', 'wahana', 'contains'),
('transportasi', 'wahana', 'contains'),
('industri-otomotif', 'wahana', 'exact'),
('modifikasi-motor', 'wahana', 'exact'),
('4wd', 'wahana', 'exact'),
('listrik', 'wahana', 'contains'),
('berkendara', 'wahana', 'contains');

-- 5. OLAH BOLA - Sport (olahraga, sport, bola, atletik)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('olahraga', 'olah-bola', 'contains'),
('sport', 'olah-bola', 'contains'),
('bola', 'olah-bola', 'contains'),
('sepak', 'olah-bola', 'contains'),
('basket', 'olah-bola', 'contains'),
('badminton', 'olah-bola', 'contains'),
('tenis', 'olah-bola', 'contains'),
('atletik', 'olah-bola', 'contains'),
('fitness', 'olah-bola', 'contains'),
('sehat', 'olah-bola', 'contains'),
('naturalisasi', 'olah-bola', 'contains'),
('diving', 'olah-bola', 'contains'),
('paragliding', 'olah-bola', 'contains');

-- 6. CERITA RASA - Kuliner (makanan, kuliner, masakan, rasa, food)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('kuliner', 'cerita-rasa', 'contains'),
('makanan', 'cerita-rasa', 'contains'),
('masakan', 'cerita-rasa', 'contains'),
('rasa', 'cerita-rasa', 'contains'),
('food', 'cerita-rasa', 'contains'),
('gizi', 'cerita-rasa', 'contains'),
('pangan', 'cerita-rasa', 'contains'),
('jajanan', 'cerita-rasa', 'contains'),
('khas', 'cerita-rasa', 'contains'),
('tradisional', 'cerita-rasa', 'contains'),
('adaptasi-makanan', 'cerita-rasa', 'exact'),
('evolusi-makanan', 'cerita-rasa', 'exact');

-- 7. AKAL BUDI - Pendidikan, Budaya, Iptek (pendidikan, teknologi, budaya, science)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('pendidikan', 'akal-budi', 'contains'),
('edukasi', 'akal-budi', 'contains'),
('teknologi', 'akal-budi', 'contains'),
('budaya', 'akal-budi', 'contains'),
('cultural', 'akal-budi', 'contains'),
('kearifan', 'akal-budi', 'contains'),
('akademik', 'akal-budi', 'contains'),
('penelitian', 'akal-budi', 'contains'),
('perguruan-tinggi', 'akal-budi', 'exact'),
('pembelajaran', 'akal-budi', 'contains'),
('kurikulum', 'akal-budi', 'contains'),
('ai', 'akal-budi', 'contains'),
('chatgpt', 'akal-budi', 'exact'),
('deep-learning', 'akal-budi', 'exact'),
('inovasi', 'akal-budi', 'contains'),
('science', 'akal-budi', 'contains'),
('sejarah', 'akal-budi', 'contains'),
('heritage', 'akal-budi', 'contains'),
('penemuan', 'akal-budi', 'contains');

-- 8. HORISON - Opini (opini, pandangan, perspektif, analisis, komentar)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('opini', 'horison', 'contains'),
('pandangan', 'horison', 'contains'),
('perspektif', 'horison', 'contains'),
('analisis', 'horison', 'contains'),
('komentar', 'horison', 'contains'),
('kritik', 'horison', 'contains'),
('review', 'horison', 'contains'),
('pemikiran', 'horison', 'contains'),
('refleksi', 'horison', 'contains'),
('tren-bahasa', 'horison', 'exact'),
('jargon', 'horison', 'contains'),
('istilah', 'horison', 'contains'),
('fomo', 'horison', 'exact'),
('disrupsi', 'horison', 'exact'),
('emansipasi', 'horison', 'exact');

-- 9. JAGAT KITA - International (international, global, dunia, world, negara)
INSERT INTO tag_category_mapping (tag_pattern, new_category_slug, pattern_type) VALUES
('international', 'jagat-kita', 'contains'),
('global', 'jagat-kita', 'contains'),
('dunia', 'jagat-kita', 'contains'),
('world', 'jagat-kita', 'contains'),
('negara', 'jagat-kita', 'contains'),
('london', 'jagat-kita', 'contains'),
('amerika', 'jagat-kita', 'contains'),
('eropa', 'jagat-kita', 'contains'),
('asia', 'jagat-kita', 'contains'),
('big-ben', 'jagat-kita', 'exact'),
('anambas', 'jagat-kita', 'contains'),
('toraja', 'jagat-kita', 'contains'),
('sulawesi', 'jagat-kita', 'contains'),
('wisata', 'jagat-kita', 'contains'),
('travel', 'jagat-kita', 'contains'),
('tourism', 'jagat-kita', 'contains'),
('destination', 'jagat-kita', 'contains'),
('explore', 'jagat-kita', 'contains'),
('adventure', 'jagat-kita', 'contains'),
('nature', 'jagat-kita', 'contains'),
('alam', 'jagat-kita', 'contains'),
('camping', 'jagat-kita', 'contains'),
('healing', 'jagat-kita', 'contains'),
('romantic', 'jagat-kita', 'contains'),
('hidden-gem', 'jagat-kita', 'contains'),
('sustainable', 'jagat-kita', 'contains'),
('eco', 'jagat-kita', 'contains'),
('diving', 'jagat-kita', 'contains'),
('snorkeling', 'jagat-kita', 'contains');

-- Show mapping statistics
SELECT 'Tag Pattern Mapping Created' as status;
SELECT new_category_slug as category, COUNT(*) as pattern_count 
FROM tag_category_mapping 
GROUP BY new_category_slug 
ORDER BY pattern_count DESC;
