-- Add essential billing features to bills table
ALTER TABLE bills 
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS terms_conditions text,
ADD COLUMN IF NOT EXISTS bank_details text;

-- Add payment status tracking
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS payment_status character varying DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue'));

-- Update existing bills to have subtotal equal to total_amount
UPDATE bills SET subtotal = total_amount WHERE subtotal = 0 OR subtotal IS NULL;

-- Add expenses table for expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_number character varying NOT NULL UNIQUE,
  vendor_name text NOT NULL,
  vendor_mobile character varying,
  category character varying NOT NULL,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  payment_status character varying DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  receipt_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Authenticated users can view expenses" 
ON expenses FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create expenses" 
ON expenses FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update expenses" 
ON expenses FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete expenses" 
ON expenses FOR DELETE 
USING (auth.uid() IS NOT NULL);