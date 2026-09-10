import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { age, gender, profession } = await req.json();

    if (!age || !gender || !profession) {
      return NextResponse.json({ error: 'Missing age, gender, or profession' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key is not configured on server.' }, { status: 500 });
    }

    const endpoint = process.env.OPENROUTER_API_KEY
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : (process.env.AI_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions');

    const prompt = `You are a personal exercise trainer. Suggest exactly 3 tailored, mindful, and restorative exercises for a person with the following profile:
Age: ${age}
Gender: ${gender}
Profession: ${profession}

These exercises should fit their profession (e.g. stretching for desk workers, relaxation exercises for teachers, etc.) and physical level.
You MUST respond with a valid JSON object containing an "exercises" key, which holds an array of exactly 3 objects.
Each exercise object must strictly have these fields:
- "title": Name of the exercise
- "duration": Duration of the exercise (e.g., "5 mins", "10 mins")
- "instructions": An array of strings, each representing a step-by-step instruction
- "benefit": The physical or mental benefit of this exercise

Do not output any markdown code blocks, preamble, or explanations outside the JSON object.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-27b', 
        messages: [
          { role: 'system', content: 'You are an expert personal exercise trainer and mindfulness coach that strictly generates well-structured, clear exercise routines and outputs only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return NextResponse.json({ error: 'Failed to generate exercises from Groq API' }, { status: 502 });
    }

    const data = await response.json();
    let resultText = data.choices?.[0]?.message?.content || '';
    
    // Strip reasoning <think>...</think> blocks
    resultText = resultText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    resultText = resultText.replace(/<think>[\s\S]*/gi, '').trim();
    
    if (!resultText) {
      return NextResponse.json({ error: 'Empty response from assistant' }, { status: 500 });
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(resultText);
    } catch {
      const cleaned = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return NextResponse.json({ exercises: parsedData.exercises || [] });

  } catch (e: any) {
    console.error('Error generating exercises:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
