import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  mobile: string;
  billNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, billNumber, customerName, totalAmount, paidAmount, unpaidAmount }: SMSRequest = await req.json();
    
    console.log("Sending SMS to:", mobile);

    // SMS Message
    const message = `GANPATI ELECTRONICS
Invoice: ${billNumber}
Customer: ${customerName}
Total: ₹${totalAmount.toFixed(2)}
Paid: ₹${paidAmount.toFixed(2)}
Unpaid: ₹${unpaidAmount.toFixed(2)}
Thank you for your business!`;

    // Get SMS API credentials from environment
    const smsApiKey = Deno.env.get("SMS_API_KEY");
    
    if (!smsApiKey) {
      throw new Error("SMS API key not configured");
    }

    // Send SMS via D7 SMS API (RapidAPI)
    const d7Response = await fetch("https://d7sms.p.rapidapi.com/messages/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "d7sms.p.rapidapi.com",
        "x-rapidapi-key": smsApiKey,
      },
      body: JSON.stringify({
        messages: [{
          channel: "sms",
          originator: "GanpatiElec",
          recipients: [mobile],
          content: message,
          data_coding: "text"
        }]
      })
    });

    const d7Data = await d7Response.json();
    console.log("D7 SMS Response:", d7Data);

    if (!d7Response.ok) {
      throw new Error(`SMS API error: ${JSON.stringify(d7Data)}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "SMS sent successfully",
        mobile: mobile 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
