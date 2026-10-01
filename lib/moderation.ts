import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModerationResult {
  isHarmful: boolean;
  reason?: string;
  category?: 'abuse' | 'medical_hazard' | 'self_harm' | 'harassment' | 'slur' | 'toxic' | 'malice' | 'demoralization' | 'safe';
  source?: 'regex' | 'gemini' | 'tavily' | 'tavily_gemini';
}

export const exactWords = [
  'mc', 'bc', 'dog', 'pig', 'ass', 'die', 'fag', 'mf', 'bsdk', 'oc', 'ocu', 'amk', 'pic', 'pd', 'chmo', 'xui', 'bobo', 'gago', 'tanga'
];

export const substringKeywords = [
  // English (Profanity, Slurs, Insults, Threats, Self-Harm, Toxicity)
  'abusive_test', 'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit',
  'bitch', 'asshole', 'cunt', 'whore', 'slut', 'bastard', 'dick', 'dickhead',
  'pussy', 'cock', 'crap', 'nigger', 'nigga', 'fag', 'faggot', 'retard', 'chink',
  'spic', 'kike', 'tranny', 'gook', 'twat', 'wanker', 'wank', 'tosser', 'scum',
  'scumbag', 'idiot', 'stupid', 'dumb', 'moron', 'fool', 'loser', 'pathetic',
  'worthless', 'useless', 'trash', 'freak', 'crazy', 'psycho', 'insane',
  'mental case', 'ugly', 'disgusting', 'shut up', 'kill', 'kill yourself',
  'suicide', 'hate you', 'die', 'go die', 'break your face', 'hang yourself',
  'drink bleach', 'take all your pills', 'end your life', 'nobody cares',
  'nobody loves you', 'waste of space', 'terrible person', 'awful person',
  'drama queen', 'stop whining', 'get over it', 'you deserve to suffer',
  'waste of breath', 'waste of oxygen', 'burden to everyone', 'burden to society',

  // Dangerous Medical Hazards & Poisoning
  'bleach', 'cyanide', 'arsenic', 'overdose on', 'lethal dose', 'poison yourself',
  'drink poison', 'rat poison',

  // Hindi / Hinglish / Urdu (Indian Subcontinent)
  'bsdk', 'bhosdike', 'bhosada', 'madarchod', 'behenchod', 'bhenchod',
  'chutiya', 'gaandu', 'gandu', 'gand', 'gandmisi', 'kutta', 'kutti',
  'suar', 'harami', 'kamina', 'saala', 'sala', 'randi', 'raand', 'ullu',
  'gadha', 'bhadwe', 'bhadwa', 'rakshas', 'nalayak', 'tatti', 'chus',
  'lodu', 'loda', 'lauda', 'jhantu', 'bhosad', 'chinay', 'kuttiya', 'marja', 'mar ja',
  'kaminey', 'haramkhor', 'bevakoof', 'bevkuf', 'pagal', 'panauti', 'bojh hai',

  // Spanish / Latin American
  'puta', 'puto', 'mierda', 'cabron', 'cabrón', 'pendejo', 'pendeja',
  'gilipollas', 'subnormal', 'malparido', 'hijo de puta', 'joder', 'coño',
  'pinche', 'verga', 'maricon', 'maricón', 'culero', 'estupido', 'imbecil',
  'zorra', 'baboso', 'mamahuevo', 'carajo', 'muérete', 'muerete', 'estorbo',

  // French
  'merde', 'putain', 'connard', 'conne', 'salope', 'bâtard', 'batard',
  'enculé', 'encule', 'fils de pute', 'bite', 'couille', 'clochard',
  'taré', 'débile', 'abrutis', 'bouffon', 'crève', 'creve',

  // German
  'scheiße', 'scheisse', 'arschloch', 'hurensohn', 'ficken', 'schlampe',
  'wichser', 'mistkerl', 'schwein', 'depp', 'missgeburt', 'fotze', 'schwuchtel', 'stirb',

  // Portuguese / Brazilian
  'porra', 'caralho', 'merda', 'filho da puta', 'filha da puta', 'arrombado',
  'babaca', 'otario', 'otário', 'piranha', 'cacete', 'viado', 'bosta', 'corno', 'trouxa',

  // Russian
  'cyka', 'suka', 'blyat', 'blia', 'pidaras', 'pidar', 'kurwa', 'gondon', 'mudak', 'eblan', 'zalupa',

  // Arabic
  'kus ohtak', 'kus omak', 'sharmota', 'sharmouta', 'kalb', 'haywan', 'ahmaq', 'tfeh', 'ibn al kalb', 'manyouk',

  // Italian
  'cazzo', 'vaffanculo', 'stronzo', 'stronza', 'troia', 'puttana', 'figlio di puttana', 'coglione', 'minchia', 'ricchione',

  // Turkish
  'siktir', 'orospu', 'göt', 'ibne', 'yarrak', 'pezevenk', 'hıyar', 'şerefsiz',

  // Tagalog / Filipino
  'putang ina', 'tangina', 'ulol', 'pokpok', 'buwisit', 'hayop', 'leche', 'punyeta',

  // Japanese & Chinese
  'baka', 'shine', 'kuso', 'yarou', 'chikushou', 'temee', 'sha bi', 'shabi', 'ta ma de', 'tamade', 'cao ni ma', 'caonima', 'jian ren', 'ben dan'
];

// Semantic malice & demoralization patterns (illness wishes, curses, telling patient their life is a curse)
export const semanticMalicePatterns = [
  // Existential demoralization / Curses on life & existence
  /(your|ur)\s+(life|existence)\s+(is|is\s+a)\s+(curse|mistake|waste|hopeless|burden|joke|disaster|sin|punishment)/i,
  /(you|u)\s+(are|r|are\s+a)\s+(curse|burden|waste\s+of\s+space|waste\s+of\s+life|mistake|disgrace)/i,
  /(you|u)\s+(are|r)\s+cursed/i,
  /(your|ur)\s+life\s+is\s+curse/i,
  /(you|u)\s+should\s+(never\s+have\s+been\s+born|not\s+exist)/i,
  /(you|u)\s+bring\s+(misfortune|bad\s+luck|curse)/i,
  
  // Wishing cancer, tumors, terminal illness
  /(hope|wish|pray|deserve|should get|may you get|go get)\s+(you|u|your family)?\s*(have|get|catch|develop|die of|suffer from)?\s*(cancer|tumor|tumour|aids|hiv|covid|paralysis|ebola|disease|stroke|heart attack|illness|fatal|blind|crippled|pain|misery|grief)/i,
  /hope\s+(you|u)\s+(have|get|catch|die of)\s+cancer/i,
  /(get|have)\s+cancer/i,
  /(you|u)\s+deserve\s+(cancer|to suffer|to die|pain|punishment|misery)/i,
  /(burn|rot)\s+in\s+hell/i,
  /(choke|drop)\s+dead/i,
  /hope\s+(you|u|your family)\s+(die|rot|suffer|burn|choke|bleed|get sick)/i,
  
  // Multilingual curses and demoralization
  /(teri|apki)\s+zindagi\s+(ek\s+)?(shrap|shraap|bojh|narak|kalank)/i,
  /tu\s+(ek\s+)?(bojh|kalank|panauti|shrap)\s+hai/i,
  /tujhe\s+cancer\s+ho/i,
  /tujhe\s+bimari\s+lage/i,
  /tera\s+satyanas/i,
  /keede\s+pad(e|enge)/i,
  /mar\s*ja/i,
  /tu\s+vida\s+es\s+una\s+maldici[oó]n/i,
  /ojal[aá]\s+te\s+d[eé]\s+c[aá]ncer/i,
  /que\s+te\s+mueras/i,
  /mu[eé]rete\s+de\s+c[aá]ncer/i,
  /ta\s+vie\s+est\s+une\s+mal[eé]diction/i,
  /j'esp[eè]re\s+que\s+tu\s+auras\s+un\s+cancer/i,
  /dein\s+leben\s+ist\s+ein\s+fluch/i,
  /hoffentlich\s+bekommst\s+du\s+krebs/i,
];

/**
 * Fast synchronous dictionary & semantic regex lookup for immediate block of slurs, malice, and death/illness wishes.
 */
export function isContentHarmful(content: string): boolean {
  if (!content) return false;
  const lower = content.toLowerCase();
  
  // Exact words
  if (exactWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(content))) {
    return true;
  }

  // Substrings
  if (substringKeywords.some(kw => lower.includes(kw))) {
    return true;
  }

  // Semantic malice and curse patterns (e.g. "your life is curse", "I hope you have cancer")
  if (semanticMalicePatterns.some(pattern => pattern.test(content))) {
    return true;
  }

  return false;
}

/**
 * Searches Tavily to ground and verify medical toxicity or hazardous advice.
 */
export async function queryTavilyModeration(query: string): Promise<{ isHarmful: boolean; reason?: string } | null> {
  const apiKey = process.env.TAVILYSEARCH_API_KEY || process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `Analyze if this message to a vulnerable mental health patient is harmful, demoralizing, wishing illness, or abusive: "${query.slice(0, 120)}". Answer clearly starting with HARMFUL or SAFE.`,
        search_depth: 'basic',
        max_results: 2,
        include_answer: true,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const answer = (data.answer || '').trim();

    if (!answer) return null;

    const startsWithHarmful = /^harmful\b/i.test(answer);
    const mentionsAbuse = /is (abusive|harmful|harassment|bullying|demoralizing|lethal|fatal|poisonous|toxic|dangerous advice|hate speech|wishing illness|ill-willed|a curse)/i.test(answer);
    const isNotHarmful = /(is safe|is not (abusive|harmful|bullying|harassment)|is supportive|is helpful|is compassionate|is benign)/i.test(answer);

    if ((startsWithHarmful || mentionsAbuse) && !isNotHarmful) {
      return {
        isHarmful: true,
        reason: answer.slice(0, 160),
      };
    }

    return { isHarmful: false };
  } catch (err) {
    console.warn('[Tavily Search] Error during moderation query:', err);
    return null;
  }
}

/**
 * Deep multi-layer moderation using Tavily Search Context and Gemini AI.
 * Comprehensively checks the SEMANTIC MEANING and INTENT of messages before delivering to user.
 */
export async function checkMessageHarmfulness(content: string): Promise<ModerationResult> {
  if (!content || !content.trim()) {
    return { isHarmful: false, category: 'safe' };
  }

  // ── LAYER 1: Immediate Semantic & Lexical Scanner ──
  if (isContentHarmful(content)) {
    // Check if demoralization or curse on life
    if (/(your|ur)?\s*(life|existence)?\s*(is|are)?\s*(a\s+)?(curse|mistake|waste|burden|shrap|panauti)/i.test(content)) {
      return {
        isHarmful: true,
        reason: 'Detected severe demoralization or emotional hostility telling patient their life is a curse or burden.',
        category: 'demoralization',
        source: 'regex',
      };
    }

    // Check if wishing illness/cancer
    if (semanticMalicePatterns.some(p => p.test(content))) {
      return {
        isHarmful: true,
        reason: 'Detected malicious intent wishing cancer, fatal illness, suffering, or death upon patient.',
        category: 'malice',
        source: 'regex',
      };
    }

    return {
      isHarmful: true,
      reason: 'Prohibited profanity, abusive vocabulary, or derogatory language detected.',
      category: 'abuse',
      source: 'regex',
    };
  }

  // ── LAYER 2: Gemini 3.8 Flash Deep Semantic & Intent Safety Evaluation ──
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `
You are the Chief Safety & Moderation AI for ECHO, a mental health, emotional wellness, and licensed medical consultation platform.
You must deeply evaluate the SEMANTIC MEANING, INTENT, SUBTEXT, and EMOTIONAL IMPACT of the following message sent by a helper (volunteer or doctor) to a patient.

MESSAGE TO EVALUATE:
"""${content}"""

A message is strictly HARMFUL if its meaning or intent conveys ANY of the following:
1. Demoralization, existential hostility, telling the patient their life is a curse, mistake, meaningless, or a burden (e.g. "your life is a curse", "you are a curse", "you are a burden to everyone", "you should never have been born").
2. Wishing fatal illnesses, cancer, tumors, infections, physical suffering, accidents, or death upon the patient or their family (e.g. "I hope you have cancer", "I wish you get sick", "You deserve pain").
3. Verbal abuse, insults, derogatory remarks, slurs, humiliation, mocking mental health struggles, hostility, or gaslighting.
4. Dangerous, lethal, reckless, or unverified medical/drug advice (e.g. promoting toxic substances, recommending dangerous dosages, urging patients to stop vital prescriptions without medical supervision).
5. Suicide or self-harm encouragement, instructions, or fatalistic reinforcement.
6. Sexual harassment, predatory solicitations, or inappropriate personal advances.
7. Coercion, emotional cruelty, or severe unprofessionalism that violates clinical/peer helper standards.

BENIGN AND EMPATHETIC RESPONSES (comforting, clinical guidance, compassionate questions, active listening, reassuring words) MUST BE CLASSIFIED AS NOT HARMFUL.

Respond strictly with a JSON object:
{
  "isHarmful": boolean,
  "reason": "Brief, clear explanation of the harmful intent/meaning, or null if safe",
  "category": "abuse" | "malice" | "demoralization" | "medical_hazard" | "self_harm" | "harassment" | "slur" | "toxic" | "safe"
}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        const parsed = JSON.parse(responseText);
        if (parsed.isHarmful) {
          return {
            isHarmful: true,
            reason: parsed.reason || 'Harmful intent or hostile communication detected by AI safety review.',
            category: parsed.category || 'malice',
            source: 'gemini',
          };
        }
        return { isHarmful: false, category: 'safe', source: 'gemini' };
      } catch {
        if (/"isHarmful":\s*true/i.test(responseText)) {
          return {
            isHarmful: true,
            reason: 'Harmful message content detected by safety review.',
            category: 'malice',
            source: 'gemini',
          };
        }
      }
    } catch (err: any) {
      console.warn('[Moderation Engine] Gemini temporary error, falling back to Tavily safety search:', err?.message || err);
    }
  }

  // ── LAYER 3: Tavily AI Search Intent Verification ──
  const hasSuspiciousTerms = /(dose|mg|pill|drug|chemical|poison|bleach|substance|prescription|paracetamol|aspirin|inject|swallow|terrible|useless|die|kill|cancer|sick|suffer|disease|curse|burden|waste)/i.test(content);
  if (hasSuspiciousTerms) {
    const tavilyResult = await queryTavilyModeration(content);
    if (tavilyResult && tavilyResult.isHarmful) {
      return {
        isHarmful: true,
        reason: tavilyResult.reason || 'Potentially harmful or hazardous content identified.',
        category: 'malice',
        source: 'tavily',
      };
    }
  }

  return { isHarmful: false, category: 'safe' };
}
