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
    <tr>
      <td style="padding: 8px; text-align: center; border: 1px solid #000;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #000;">${item.product_name}</td>
      <td style="padding: 8px; text-align: center; border: 1px solid #000;">${item.product_code}</td>
      <td style="padding: 8px; text-align: center; border: 1px solid #000;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #000;">₹${item.unit_price.toFixed(2)}</td>
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
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #000;
    }
    .customer-info {
      font-size: 12px;
    }
    .customer-name {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .shop-name {
      text-align: center;
      margin-bottom: 5px;
    }
    .shop-name h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .shop-name p {
      font-size: 12px;
      margin-bottom: 2px;
    }
    .bill-details {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;
      padding: 10px 0;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .bill-detail-item {
      font-size: 13px;
    }
    .bill-detail-item strong {
      font-weight: bold;
    }
    .address-section {
      margin: 10px 0;
      padding: 8px;
      border: 1px solid #000;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: white;
      color: #000;
      padding: 8px;
      text-align: center;
      font-size: 13px;
      border: 1px solid #000;
      font-weight: bold;
    }
    td {
      font-size: 12px;
    }
    .total-section {
      margin-top: 20px;
      text-align: right;
      padding: 15px;
      border-top: 2px solid #000;
    }
    .total-row {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .payment-info {
      font-size: 13px;
      margin-top: 5px;
    }
    @media print {
      body { padding: 0; }
      .bill-container { border: none; }
    }
  </style>
</head>
<body>
  <div class="bill-container">
    <div class="header">
      <div class="customer-info">
        <div class="customer-name">${bill.customer_name}</div>
        <div>${bill.customer_mobile}</div>
      </div>
      <div class="customer-info" style="text-align: right;">
        <div class="customer-name">बिल संख्या: ${bill.bill_number}</div>
        <div>समय: ${formattedTime}</div>
      </div>
    </div>
    
    <div class="shop-name">
      <h1>GANPATI ELECTRONICS & E-SERVICES BATADU</h1>
      <p>आप स्वतंत्र वाणो गदों वन भाकृड- बाटाडू</p>
    </div>
    
    <div class="bill-details">
      <div class="bill-detail-item">
        <strong>बिल नं.:</strong> ${bill.bill_number}
      </div>
      <div class="bill-detail-item">
        <strong>दिनांक:</strong> ${formattedDate}
      </div>
    </div>
    
    <div class="address-section">
      <strong>जीवोहार:</strong> ${bill.customer_address || 'N/A'}
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">क्र.स.</th>
          <th>विवरण</th>
          <th style="width: 100px;">नामंबर</th>
          <th style="width: 60px;">दर</th>
          <th style="width: 100px;">रकम रु.</th>
          <th style="width: 60px;">पै.</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <div class="total-section">
      <div class="total-row">
        कुल रकम: ₹${bill.total_amount.toFixed(2)}
      </div>
      <div class="payment-info">
        भुगतान विधि: ${bill.payment_method === 'cash' ? 'नकद' : 'मैनुअल'}
      </div>
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
