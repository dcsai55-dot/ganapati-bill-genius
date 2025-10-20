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
  const formattedTime = date.toLocaleTimeString("en-IN");

  const itemsHTML = items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center;">${idx + 1}</td>
      <td style="padding: 12px 8px;">${item.product_code}</td>
      <td style="padding: 12px 8px;">${item.product_name}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">₹${item.unit_price.toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">₹${item.total_price.toFixed(2)}</td>
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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 40px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .shop-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .shop-subtitle {
      font-size: 14px;
      opacity: 0.9;
      letter-spacing: 1px;
    }
    .invoice-title {
      background: #f9fafb;
      padding: 20px 40px;
      border-bottom: 3px solid #667eea;
    }
    .invoice-title h2 {
      color: #1f2937;
      font-size: 24px;
      font-weight: 600;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      padding: 30px 40px;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-block {
      flex: 1;
    }
    .info-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-value {
      color: #1f2937;
      font-size: 16px;
      font-weight: 500;
    }
    .bill-details {
      display: flex;
      gap: 20px;
    }
    .bill-detail-item {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #667eea;
      color: white;
      padding: 14px 8px;
      text-align: left;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    th:nth-child(1), td:nth-child(1) { width: 50px; }
    th:nth-child(4), td:nth-child(4) { text-align: center; width: 80px; }
    th:nth-child(5), th:nth-child(6), td:nth-child(5), td:nth-child(6) { text-align: right; }
    td {
      padding: 12px 8px;
      color: #374151;
      font-size: 14px;
    }
    .total-section {
      padding: 30px 40px;
      background: #f9fafb;
      border-top: 2px solid #667eea;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
    }
    .total-label {
      font-size: 18px;
      color: #1f2937;
      font-weight: 600;
    }
    .total-amount {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
    }
    .payment-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #10b981;
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      padding: 30px 40px;
      text-align: center;
      background: white;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
    }
    .thank-you {
      font-size: 18px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 8px;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="shop-name">GANAPATI ELECTRONICS & EMITRA</div>
      <div class="shop-subtitle">BATADU</div>
    </div>
    
    <div class="invoice-title">
      <h2>INVOICE / TAX INVOICE</h2>
    </div>
    
    <div class="info-section">
      <div class="info-block">
        <div class="info-label">Customer Details</div>
        <div class="info-value" style="font-size: 18px; margin-bottom: 8px;">${bill.customer_name}</div>
        <div class="info-value" style="font-size: 14px; color: #6b7280;">📞 ${bill.customer_mobile}</div>
        ${bill.customer_address ? `<div class="info-value" style="font-size: 14px; color: #6b7280; margin-top: 4px;">📍 ${bill.customer_address}</div>` : ""}
      </div>
      
      <div class="info-block" style="text-align: right;">
        <div class="bill-details" style="justify-content: flex-end;">
          <div class="bill-detail-item">
            <div class="info-label">Bill No.</div>
            <div class="info-value" style="font-family: monospace;">${bill.bill_number}</div>
          </div>
          <div class="bill-detail-item">
            <div class="info-label">Date</div>
            <div class="info-value">${formattedDate}</div>
          </div>
          <div class="bill-detail-item">
            <div class="info-label">Time</div>
            <div class="info-value">${formattedTime}</div>
          </div>
        </div>
        <div style="margin-top: 12px;">
          <span class="payment-badge">${bill.payment_method.toUpperCase()}</span>
        </div>
      </div>
    </div>
    
    <div style="padding: 0 40px;">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Code</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
    </div>
    
    <div class="total-section">
      <div class="total-row">
        <span class="total-label">TOTAL AMOUNT</span>
        <span class="total-amount">₹${bill.total_amount.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="footer">
      <div class="thank-you">Thank You for Your Business!</div>
      <div class="footer-text">
        For any queries, please contact us<br>
        GANAPATI ELECTRONICS & EMITRA, BATADU
      </div>
    </div>
  </div>
  
  <script>
    // Auto-print when loaded
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
}
