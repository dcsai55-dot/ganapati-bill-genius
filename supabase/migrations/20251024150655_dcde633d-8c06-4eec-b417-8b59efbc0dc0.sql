-- Create currencies table for multi-currency support
CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  is_base BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  customer_address TEXT,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, sent, accepted, rejected, converted
  notes TEXT,
  terms TEXT,
  currency_id UUID REFERENCES public.currencies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quote items table
CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recurring billing schedules table
CREATE TABLE public.recurring_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  schedule_name TEXT NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE,
  next_bill_date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency_id UUID REFERENCES public.currencies(id),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recurring schedule items table
CREATE TABLE public.recurring_schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.recurring_schedules(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create credit notes table
CREATE TABLE public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number VARCHAR(50) NOT NULL UNIQUE,
  bill_id UUID REFERENCES public.bills(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  credit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(10, 2) NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'issued', -- issued, applied, void
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create credit note items table
CREATE TABLE public.credit_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_id UUID NOT NULL REFERENCES public.credit_notes(id) ON DELETE CASCADE,
  product_code VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debit notes table
CREATE TABLE public.debit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debit_note_number VARCHAR(50) NOT NULL UNIQUE,
  bill_id UUID REFERENCES public.bills(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  debit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(10, 2) NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'issued', -- issued, applied, void
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debit note items table
CREATE TABLE public.debit_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debit_note_id UUID NOT NULL REFERENCES public.debit_notes(id) ON DELETE CASCADE,
  product_code VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment reminders table
CREATE TABLE public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.bills(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  reminder_type VARCHAR(20) NOT NULL, -- first, second, final, legal
  days_overdue INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_via VARCHAR(20) NOT NULL, -- email, sms, both
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- sent, failed, read
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add multi-currency support to bills
ALTER TABLE public.bills ADD COLUMN currency_id UUID REFERENCES public.currencies(id);
ALTER TABLE public.bills ADD COLUMN exchange_rate NUMERIC(10, 4) DEFAULT 1.0;
ALTER TABLE public.bills ADD COLUMN converted_to_bill_id UUID REFERENCES public.bills(id);

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, is_base, exchange_rate) VALUES
('USD', 'US Dollar', '$', true, 1.0000),
('EUR', 'Euro', '€', false, 0.9200),
('GBP', 'British Pound', '£', false, 0.7900),
('INR', 'Indian Rupee', '₹', false, 83.1200),
('AUD', 'Australian Dollar', 'A$', false, 1.5300),
('CAD', 'Canadian Dollar', 'C$', false, 1.3500);

-- Enable RLS on all new tables
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for currencies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view currencies" ON public.currencies
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create RLS policies for quotes
CREATE POLICY "Authenticated users can view quotes" ON public.quotes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for quote items
CREATE POLICY "Authenticated users can view quote items" ON public.quote_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create quote items" ON public.quote_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for recurring schedules
CREATE POLICY "Authenticated users can view recurring schedules" ON public.recurring_schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create recurring schedules" ON public.recurring_schedules
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update recurring schedules" ON public.recurring_schedules
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for recurring schedule items
CREATE POLICY "Authenticated users can view recurring schedule items" ON public.recurring_schedule_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create recurring schedule items" ON public.recurring_schedule_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for credit notes
CREATE POLICY "Authenticated users can view credit notes" ON public.credit_notes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create credit notes" ON public.credit_notes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update credit notes" ON public.credit_notes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for credit note items
CREATE POLICY "Authenticated users can view credit note items" ON public.credit_note_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create credit note items" ON public.credit_note_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for debit notes
CREATE POLICY "Authenticated users can view debit notes" ON public.debit_notes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create debit notes" ON public.debit_notes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update debit notes" ON public.debit_notes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for debit note items
CREATE POLICY "Authenticated users can view debit note items" ON public.debit_note_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create debit note items" ON public.debit_note_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for payment reminders
CREATE POLICY "Authenticated users can view payment reminders" ON public.payment_reminders
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create payment reminders" ON public.payment_reminders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create triggers for updated_at columns
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_schedules_updated_at
  BEFORE UPDATE ON public.recurring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at
  BEFORE UPDATE ON public.currencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();