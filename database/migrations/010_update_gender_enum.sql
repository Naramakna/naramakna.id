-- ========================================
-- UPDATE GENDER ENUM TO ONLY MALE/FEMALE
-- Simplify gender options
-- ========================================

ALTER TABLE user_profiles 
MODIFY COLUMN gender ENUM('male', 'female') NULL COMMENT 'Jenis kelamin - Laki-laki atau Perempuan';

-- Verification
SELECT 'Gender enum updated to male/female only!' as status;
