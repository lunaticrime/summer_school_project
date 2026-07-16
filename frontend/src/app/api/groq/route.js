import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { plan, comment } = await req.json();

    const groqKey = "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";

    const prompt = `You are an AI assistant generating a personalized learning plan.
The teacher has requested changes to an existing plan.
Original Objective: ${plan.objective_summary || plan.plan_title || ''}
Teacher Comment: ${comment}

Respond with a valid JSON object containing the updated fields:
{
  "plan_title": "New Title",
  "objective_summary": "New objective based on teacher feedback...",
  "success_criteria_summary": "New success criteria..."
}
Only output the JSON object. Do not include markdown code blocks like \`\`\`json.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error from Groq API');
    }

    const content = data.choices[0].message.content.trim();
    // Sometimes LLMs still wrap in markdown even if instructed not to.
    const cleanContent = content.replace(/^```json\s*/i, '').replace(/```$/i, '');
    const result = JSON.parse(cleanContent);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
