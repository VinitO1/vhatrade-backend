-- Create contacts table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(100),
    phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from authenticated and anonymous users
CREATE POLICY "Allow public inserts" ON contacts
    FOR INSERT WITH CHECK (true);

-- Create policy to allow reads only for authenticated users (admin access)
CREATE POLICY "Allow authenticated reads" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow updates only for authenticated users
CREATE POLICY "Allow authenticated updates" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow deletes only for authenticated users
CREATE POLICY "Allow authenticated deletes" ON contacts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at column
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO contacts (name, email, company, phone, subject, message) VALUES
-- ('John Doe', 'john@example.com', 'ABC Company', '+1234567890', 'Import Inquiry', 'I would like to discuss importing products from your network.'),
-- ('Jane Smith', 'jane@example.com', 'XYZ Corp', '+0987654321', 'Export Services', 'Looking for export services for our products.');
