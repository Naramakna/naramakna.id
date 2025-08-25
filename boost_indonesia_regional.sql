-- Boosting Regional Analytics untuk Indonesia
-- Script untuk menambah data analytics dengan fokus kota-kota besar Indonesia

-- Insert boost data untuk Bandung (Jawa Barat) - 50,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('114.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JB' as region,
    'Bandung' as city,
    -6.9175 as latitude,
    107.6191 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t3,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t4,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t5
LIMIT 50000;

-- Insert boost data untuk Jakarta - 35,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('103.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JK' as region,
    'Jakarta' as city,
    -6.2088 as latitude,
    106.8456 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t3,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) t4
LIMIT 35000;

-- Insert boost data untuk Surabaya (Jawa Timur) - 25,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('115.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JI' as region,
    'Surabaya' as city,
    -7.2575 as latitude,
    112.7521 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t3
LIMIT 25000;

-- Insert boost data untuk Yogyakarta - 18,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('110.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'YO' as region,
    'Yogyakarta' as city,
    -7.7956 as latitude,
    110.3695 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) t3
LIMIT 18000;

-- Insert boost data untuk Semarang (Jawa Tengah) - 15,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('112.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Android 12; SM-G991B) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JT' as region,
    'Semarang' as city,
    -6.9665 as latitude,
    110.4203 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t3
LIMIT 15000;

-- Insert boost data untuk Medan (Sumatra Utara) - 12,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('118.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Linux; Android 11; SM-A515F) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'SU' as region,
    'Medan' as city,
    3.5952 as latitude,
    98.6722 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2,
    (SELECT 1 UNION SELECT 2) t3
LIMIT 12000;

-- Insert boost data untuk Padang (Sumatra Barat) - 8,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('117.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'SB' as region,
    'Padang' as city,
    -0.9471 as latitude,
    100.4172 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) t4
LIMIT 8000;

-- Insert boost data untuk Pontianak (Kalimantan Barat) - 6,000 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('116.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'KB' as region,
    'Pontianak' as city,
    -0.0263 as latitude,
    109.3425 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) t4
LIMIT 6000;

-- Insert boost data untuk Malang (Jawa Timur) - 5,500 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('119.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Android 10; SM-G973F) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JI' as region,
    'Malang' as city,
    -7.9666 as latitude,
    112.6326 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) t4
LIMIT 5500;

-- Insert boost data untuk Solo/Surakarta (Jawa Tengah) - 4,500 views
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('113.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JT' as region,
    'Solo' as city,
    -7.5675 as latitude,
    110.8251 as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t4
LIMIT 4500;

-- Tambahan kota-kota kecil di Jawa Barat untuk boost Bandung area
INSERT INTO analytics (content_id, content_type, event_type, user_ip, user_agent, referrer, country, region, city, latitude, longitude, timezone, timestamp) 
SELECT 
    (FLOOR(RAND() * 500) + 1) as content_id,
    'post' as content_type,
    'view' as event_type,
    CONCAT('114.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255), '.', FLOOR(RAND() * 255)) as user_ip,
    'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36' as user_agent,
    'https://google.com/' as referrer,
    'Indonesia' as country,
    'JB' as region,
    CASE (FLOOR(RAND() * 6))
        WHEN 0 THEN 'Cimahi' 
        WHEN 1 THEN 'Tasikmalaya'
        WHEN 2 THEN 'Bekasi'
        WHEN 3 THEN 'Bogor'
        WHEN 4 THEN 'Depok'
        ELSE 'Cirebon'
    END as city,
    -6.8 + (RAND() * 0.4) as latitude,
    107.4 + (RAND() * 0.8) as longitude,
    'Asia/Jakarta' as timezone,
    DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 30) DAY) as timestamp
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t4
LIMIT 8000;