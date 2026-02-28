import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { submissionId, title, description } = await req.json();
    
    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: "Title and description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert skill evaluator for a Web3 education platform. 
Evaluate student project submissions and return a structured assessment.
Score from 0-100 based on:
- Technical depth (30%)
- Innovation/creativity (25%)
- Completeness (25%)
- Documentation quality (20%)

You MUST respond by calling the evaluate_submission function.`,
          },
          {
            role: "user",
            content: `Evaluate this submission:\n\nTitle: ${title}\n\nDescription: ${description}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_submission",
              description: "Return structured evaluation of a student submission",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Overall score from 0-100",
                  },
                  feedback: {
                    type: "string",
                    description: "Detailed feedback in 2-3 sentences",
                  },
                },
                required: ["score", "feedback"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "evaluate_submission" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI evaluation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const evaluation = JSON.parse(toolCall.function.arguments);
    const score = Math.min(100, Math.max(0, Math.round(evaluation.score)));

    return new Response(
      JSON.stringify({ score, feedback: evaluation.feedback, submissionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("evaluate-submission error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Evaluation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
