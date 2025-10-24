import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BillData {
  billId: string;
  billNumber: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  customerId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { billId, billNumber, totalAmount, paidAmount, unpaidAmount }: BillData = await req.json();

    console.log("Creating journal entry for bill:", billNumber);

    // Get account IDs for the journal entry
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("id, account_code")
      .in("account_code", ["1100", "4000", "1000"]); // AR, Sales Revenue, Cash

    if (accountsError) {
      throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
    }

    const arAccount = accounts.find(a => a.account_code === "1100");
    const revenueAccount = accounts.find(a => a.account_code === "4000");
    const cashAccount = accounts.find(a => a.account_code === "1000");

    if (!arAccount || !revenueAccount || !cashAccount) {
      throw new Error("Required accounts not found in Chart of Accounts");
    }

    // Generate entry number
    const entryNumber = `JE-${Date.now()}`;
    const entryDate = new Date().toISOString().split('T')[0];

    // Create journal entry header
    const { data: journalEntry, error: entryError } = await supabase
      .from("journal_entries")
      .insert({
        entry_number: entryNumber,
        entry_date: entryDate,
        description: `Bill ${billNumber} - Sale transaction`,
        reference_type: "bill",
        reference_id: billId,
        status: "posted"
      })
      .select()
      .single();

    if (entryError) {
      throw new Error(`Failed to create journal entry: ${entryError.message}`);
    }

    // Create journal entry lines (double-entry bookkeeping)
    const lines = [];

    // 1. Debit Accounts Receivable (Asset increases)
    lines.push({
      journal_entry_id: journalEntry.id,
      account_id: arAccount.id,
      debit_amount: totalAmount,
      credit_amount: 0,
      description: `Bill ${billNumber} - Amount receivable`
    });

    // 2. Credit Sales Revenue (Revenue increases)
    lines.push({
      journal_entry_id: journalEntry.id,
      account_id: revenueAccount.id,
      debit_amount: 0,
      credit_amount: totalAmount,
      description: `Bill ${billNumber} - Sales revenue`
    });

    // 3. If payment received, record cash transaction
    if (paidAmount > 0) {
      // Debit Cash (Asset increases)
      lines.push({
        journal_entry_id: journalEntry.id,
        account_id: cashAccount.id,
        debit_amount: paidAmount,
        credit_amount: 0,
        description: `Bill ${billNumber} - Payment received`
      });

      // Credit AR (Asset decreases)
      lines.push({
        journal_entry_id: journalEntry.id,
        account_id: arAccount.id,
        debit_amount: 0,
        credit_amount: paidAmount,
        description: `Bill ${billNumber} - Payment applied to AR`
      });
    }

    const { error: linesError } = await supabase
      .from("journal_entry_lines")
      .insert(lines);

    if (linesError) {
      throw new Error(`Failed to create journal entry lines: ${linesError.message}`);
    }

    console.log("Journal entry created successfully:", entryNumber);

    return new Response(
      JSON.stringify({
        success: true,
        entryNumber,
        message: "Journal entry created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-journal-entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
