-- Simple boost script untuk regional Indonesia
-- Drop procedure if exists
DROP PROCEDURE IF EXISTS BoostBandung;
DROP PROCEDURE IF EXISTS BoostJakarta;
DROP PROCEDURE IF EXISTS BoostSurabaya;

-- Create procedure untuk boost Bandung 
DELIMITER $$
CREATE PROCEDURE BoostBandung()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 20000 DO
    INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
    VALUES (
      FLOOR(RAND() * 500) + 1,
      'post',
      'view',
      CONCAT('114.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)),
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'https://google.com/',
      'Indonesia',
      'JB',
      'Bandung',
      -6.9175,
      107.6191,
      'Asia/Jakarta',
      DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY)
    );
    SET i = i + 1;
  END WHILE;
END$$

-- Create procedure untuk boost Jakarta
CREATE PROCEDURE BoostJakarta()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 15000 DO
    INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
    VALUES (
      FLOOR(RAND() * 500) + 1,
      'post',
      'view',
      CONCAT('103.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)),
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0)',
      'https://google.com/',
      'Indonesia',
      'JK',
      'Jakarta',
      -6.2088,
      106.8456,
      'Asia/Jakarta',
      DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY)
    );
    SET i = i + 1;
  END WHILE;
END$$

-- Create procedure untuk boost Surabaya
CREATE PROCEDURE BoostSurabaya()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 12000 DO
    INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
    VALUES (
      FLOOR(RAND() * 500) + 1,
      'post',
      'view',
      CONCAT('115.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)),
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      'https://google.com/',
      'Indonesia',
      'JI',
      'Surabaya',
      -7.2575,
      112.7521,
      'Asia/Jakarta',
      DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY)
    );
    SET i = i + 1;
  END WHILE;
END$$

DELIMITER ;

-- Execute procedures
CALL BoostBandung();
CALL BoostJakarta();  
CALL BoostSurabaya();

-- Clean up
DROP PROCEDURE BoostBandung;
DROP PROCEDURE BoostJakarta;
DROP PROCEDURE BoostSurabaya;