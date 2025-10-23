-- Add missing columns to bills table
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS unpaid_amount numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS remarks text;

-- Update existing bills to have correct paid/unpaid amounts
UPDATE public.bills 
SET unpaid_amount = total_amount 
WHERE unpaid_amount = 0 AND paid_amount = 0;

-- Add UPDATE policy for bills table
CREATE POLICY "Authenticated users can update bills"
ON public.bills
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);