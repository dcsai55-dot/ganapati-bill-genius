-- Create account types enum
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- Create account categories enum
CREATE TYPE account_category AS ENUM (
  'current_asset', 'fixed_asset', 'other_asset',
  'current_liability', 'long_term_liability',
  'equity',
  'operating_revenue', 'other_revenue',
  'cost_of_goods_sold', 'operating_expense', 'other_expense'
);

-- Chart of Accounts
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(20) NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  account_category account_category NOT NULL,
  parent_account_id UUID REFERENCES public.accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- General Ledger
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'bill', 'payment', 'adjustment', 'manual'
  reference_id UUID, -- links to bills, payments, etc.
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'posted', -- 'draft', 'posted', 'void'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Journal Entry Line Items (double-entry bookkeeping)
CREATE TABLE public.journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  debit_amount NUMERIC(15,2) DEFAULT 0,
  credit_amount NUMERIC(15,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view journal entry lines"
  ON public.journal_entry_lines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create journal entry lines"
  ON public.journal_entry_lines FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Chart of Accounts
INSERT INTO public.accounts (account_code, account_name, account_type, account_category, description) VALUES
-- Assets
('1000', 'Cash', 'asset', 'current_asset', 'Cash on hand and in bank'),
('1100', 'Accounts Receivable', 'asset', 'current_asset', 'Money owed by customers'),
('1200', 'Inventory', 'asset', 'current_asset', 'Products in stock'),
('1500', 'Fixed Assets', 'asset', 'fixed_asset', 'Long-term assets'),

-- Liabilities
('2000', 'Accounts Payable', 'liability', 'current_liability', 'Money owed to suppliers'),
('2100', 'Sales Tax Payable', 'liability', 'current_liability', 'Sales tax collected'),

-- Equity
('3000', 'Owner Equity', 'equity', 'equity', 'Owner investment'),
('3100', 'Retained Earnings', 'equity', 'equity', 'Accumulated profits'),

-- Revenue
('4000', 'Sales Revenue', 'revenue', 'operating_revenue', 'Revenue from product sales'),
('4100', 'Service Revenue', 'revenue', 'operating_revenue', 'Revenue from services'),

-- Expenses
('5000', 'Cost of Goods Sold', 'expense', 'cost_of_goods_sold', 'Direct cost of products sold'),
('6000', 'Operating Expenses', 'expense', 'operating_expense', 'General business expenses'),
('6100', 'Salaries & Wages', 'expense', 'operating_expense', 'Employee compensation'),
('6200', 'Rent Expense', 'expense', 'operating_expense', 'Facility rent'),
('6300', 'Utilities', 'expense', 'operating_expense', 'Electricity, water, etc.');