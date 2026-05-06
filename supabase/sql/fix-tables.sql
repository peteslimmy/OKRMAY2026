-- Add missing status column to objectives if needed
DO $$ 
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'objectives' AND column_name = 'status'
    ) THEN
        ALTER TABLE objectives ADD COLUMN status TEXT DEFAULT 'Active';
    END IF;
    
    -- Add lock_date if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'objectives' AND column_name = 'lock_date'
    ) THEN
        ALTER TABLE objectives ADD COLUMN lock_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'objectives'
ORDER BY ordinal_position;