-- ========================================
-- AUTO WRITER ROLE TRIGGER
-- ========================================
-- Trigger untuk mengubah user menjadi writer otomatis saat login
-- dan sudah mengisi data profile lengkap

DELIMITER $$

-- Trigger saat user update last_login (login)
DROP TRIGGER IF EXISTS auto_assign_writer_on_login$$

CREATE TRIGGER auto_assign_writer_on_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    -- Cek jika last_login berubah (user baru login) dan role masih 'user'
    IF NEW.last_login != OLD.last_login AND NEW.user_role = 'user' THEN
        
        -- Cek apakah user sudah mengisi data profile lengkap
        IF EXISTS (
            SELECT 1 
            FROM user_profiles up 
            WHERE up.user_id = NEW.ID 
            AND up.birth_date IS NOT NULL 
            AND up.gender IS NOT NULL 
            AND up.phone_number IS NOT NULL 
            AND up.city IS NOT NULL 
            AND up.profession IS NOT NULL
        ) THEN
            -- Update role menjadi writer
            UPDATE users SET user_role = 'writer' WHERE ID = NEW.ID;
        END IF;
    END IF;
END$$

-- Trigger saat user update profile data
DROP TRIGGER IF EXISTS auto_assign_writer_on_profile_complete$$

CREATE TRIGGER auto_assign_writer_on_profile_complete
AFTER UPDATE ON user_profiles
FOR EACH ROW
BEGIN
    -- Cek jika profile data lengkap terisi
    IF NEW.birth_date IS NOT NULL 
       AND NEW.gender IS NOT NULL 
       AND NEW.phone_number IS NOT NULL 
       AND NEW.city IS NOT NULL 
       AND NEW.profession IS NOT NULL THEN
        
        -- Update user role menjadi writer jika masih user
        UPDATE users 
        SET user_role = 'writer' 
        WHERE ID = NEW.user_id 
        AND user_role = 'user';
    END IF;
END$$

DELIMITER ;

-- Verification
SELECT 'Auto Writer Triggers created successfully!' as status;
SHOW TRIGGERS WHERE `Table` IN ('users', 'user_profiles');
