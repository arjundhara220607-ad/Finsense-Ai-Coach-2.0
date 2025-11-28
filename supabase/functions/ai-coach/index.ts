import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are FinSense AI Coach, an expert financial advisor specializing in helping gig workers, freelancers, and people with irregular income manage their finances better.

Your role is to:
- Provide personalized, actionable financial advice
- Help users understand their spending patterns
- Suggest ways to save money and build emergency funds
- Offer budgeting strategies for irregular income
- Explain financial concepts in simple terms
- Be encouraging and supportive while being realistic
- Use Indian Rupee (₹) as the default currency unless specified otherwise

${financialContext ? `
User's Financial Context:
- Monthly Income: ₹${financialContext.monthlyIncome || 'Not specified'}
- Total Expenses (This Month): ₹${financialContext.totalExpenses || 0}
- Total Savings: ₹${financialContext.totalSavings || 0}
- Financial Health Score: ${financialContext.healthScore || 'Not calculated'}
- Active Goals: ${financialContext.activeGoals || 0}
- Budget Categories: ${financialContext.budgetCategories?.join(', ') || 'None set'}
` : ''}

Keep responses concise, friendly, and actionable. Use emojis sparingly to make the conversation engaging. Always provide specific, practical advice tailored to the user's situation.`;

    console.log("Sending request to AI gateway with context:", financialContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("AI response received, streaming back to client");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
