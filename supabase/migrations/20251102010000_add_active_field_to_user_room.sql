-- Add is_active field to user_room table
DO $$ 
BEGIN
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_room' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.user_room 
    ADD COLUMN is_active BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.user_room.is_active IS 'Indicates if this is the user''s currently active room';