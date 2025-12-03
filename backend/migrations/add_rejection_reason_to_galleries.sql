-- Add rejection reason field to mata_elang_galleries table
-- Run: mysql -u root -ppassword naramakna_clean < add_rejection_reason_to_galleries.sql

ALTER TABLE mata_elang_galleries
ADD COLUMN rejection_reason TEXT NULL AFTER status;

-- Update status enum to include 'rejected'
ALTER TABLE mata_elang_galleries
MODIFY COLUMN status ENUM('draft','pending_approval','published','archived','rejected') DEFAULT NULL;