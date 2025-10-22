import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BillData {
  id: string;
  bill_number: string;
  customer_name: string;
  customer_mobile: string;
  customer_address?: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  description?: string;
}

interface BillItem {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { billId } = await req.json();
    console.log("Generating PDF for bill:", billId);

    // Fetch bill data
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .select("*")
      .eq("id", billId)
      .single();

    if (billError) throw billError;

    // Fetch bill items
    const { data: items, error: itemsError } = await supabase
      .from("bill_items")
      .select("*")
      .eq("bill_id", billId);

    if (itemsError) throw itemsError;

    // Generate HTML for PDF
    const html = generateBillHTML(bill as BillData, items as BillItem[]);

    // Return HTML as PDF response
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateBillHTML(bill: BillData, items: BillItem[]): string {
  const date = new Date(bill.created_at);
  const formattedDate = date.toLocaleDateString("en-IN");

  const itemsHTML = items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 8px; text-align: center; border: 1px solid #000;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #000;">${item.product_name}</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #000;">₹${item.unit_price.toFixed(2)}</td>
      <td style="padding: 8px; text-align: center; border: 1px solid #000;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #000;">₹${item.total_price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px;
      background: white;
    }
    .bill-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 20px;
    }
    .shop-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .shop-header h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .shop-header .address {
      font-size: 12px;
      margin-bottom: 3px;
    }
    .shop-header .contacts {
      font-size: 11px;
      margin-top: 5px;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;
      padding: 10px 0;
      border-bottom: 1px solid #000;
      font-size: 14px;
    }
    .customer-section {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #000;
    }
    .customer-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .customer-section p {
      font-size: 12px;
      margin: 3px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: white;
      color: #000;
      padding: 10px 8px;
      text-align: center;
      font-size: 13px;
      border: 1px solid #000;
      font-weight: bold;
    }
    td {
      padding: 8px;
      font-size: 12px;
      border: 1px solid #000;
    }
    .summary-section {
      margin-top: 20px;
      border-top: 2px solid #000;
      padding-top: 15px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 14px;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: bold;
      border-top: 1px solid #000;
      padding-top: 10px;
      margin-top: 10px;
    }
    .summary-row.unpaid {
      font-weight: bold;
      color: #d32f2f;
    }
    .remarks-section {
      margin-top: 20px;
      padding: 10px;
      border: 1px solid #000;
      min-height: 60px;
    }
    .remarks-section strong {
      font-size: 12px;
    }
    .remarks-section p {
      font-size: 11px;
      margin-top: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #000;
      font-size: 11px;
    }
    .signature-line {
      margin-top: 30px;
      text-align: right;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; }
      .bill-container { border: none; }
    }
  </style>
</head>
<body>
  <div class="bill-container">
    <div class="shop-header">
      <h1>GANPATI ELECTRONICS & E SERVICES</h1>
      <p class="address">Main Market Batadu, Barmer (Raj.) 344035</p>
      <p class="contacts">Joga Ram 9928754381 &nbsp;&nbsp;&nbsp;&nbsp; Devendra Sai 7726969098</p>
    </div>
    
    <div class="invoice-details">
      <div><strong>Invoice No.</strong> ${bill.bill_number}</div>
      <div><strong>Date:</strong> ${formattedDate}</div>
    </div>
    
    <div class="customer-section">
      <h3>CUSTOMER DETAILS:</h3>
      <p><strong>Name:</strong> ${bill.customer_name}</p>
      <p><strong>Mobile:</strong> ${bill.customer_mobile}</p>
      <p><strong>Address:</strong> ${bill.customer_address || 'N/A'}</p>
      ${bill.description ? `<p><strong>Description:</strong> ${bill.description}</p>` : ''}
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">S.R</th>
          <th>PRODUCT NAME</th>
          <th style="width: 100px;">PRICE</th>
          <th style="width: 80px;">QUANTITY</th>
          <th style="width: 120px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <div class="summary-section">
      <div class="summary-row total">
        <span>TOTAL</span>
        <span>₹${bill.total_amount.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>PAID</span>
        <span>₹${(bill as any).paid_amount ? (bill as any).paid_amount.toFixed(2) : '0.00'}</span>
      </div>
      <div class="summary-row unpaid">
        <span>UNPAID</span>
        <span>₹${(bill as any).unpaid_amount ? (bill as any).unpaid_amount.toFixed(2) : bill.total_amount.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="remarks-section">
      <strong>Remarks:</strong>
      <p>${(bill as any).remarks || 'None'}</p>
    </div>
    
    <div class="signature-line">
      Signature: _________________
    </div>
    
    <div class="footer">
      Generated on ${formattedDate} | Thank you!
    </div>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
}
