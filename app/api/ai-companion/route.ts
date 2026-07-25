import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

// Initialize Groq client using the OpenAI-compatible SDK
const getGroqClient = () => new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages } = await req.json();

    // Llama 3 on Groq often requires the first message to be from 'user'.
    // We'll strip any leading 'assistant' messages (like the greeting).
    const sanitizedMessages = Array.isArray(messages) 
      ? messages.filter((m: any, i: number) => i > 0 || m.role === 'user') 
      : [];

    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', 
      messages: [
        {
          role: 'system',
          content: `You are ECHO, a compassionate AI mental health companion. Your role is to:
- Listen actively and empathetically to users
- Provide supportive, non-judgmental responses
- Encourage healthy coping strategies and self-care
- Gently suggest professional help when needed
- Never diagnose or treat mental health conditions
- Keep responses warm, calm, and supportive
- Use a gentle, caring tone always
- Keep your phrasing conversational, natural, and rhythmic so that it flows smoothly and soothingly when read aloud by our voice synthesizer`,
        },
        ...sanitizedMessages,
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: false,
    });

    const responseText = response.choices[0]?.message?.content;

    return NextResponse.json({
      message: responseText || "I'm listening and I'm here for you. 💜",
    });

  } catch (error: any) {
    console.error('Groq AI Error:', error.message);
    return NextResponse.json({ 
      error: 'AI Companion is momentarily unavailable.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}