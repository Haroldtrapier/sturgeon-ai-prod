-- Create wins table
CREATE TABLE IF NOT EXISTS wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunityTitle TEXT NOT NULL,
  agency TEXT,
  amount NUMERIC,
  contractNumber TEXT,
  description TEXT,
  dateWon DATE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on dateWon for faster sorting
CREATE INDEX IF NOT EXISTS idx_wins_date_won ON wins(dateWon DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wins_updated_at
  BEFORE UPDATE ON wins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
