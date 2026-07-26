export const exactWords = [
  'mc', 'bc', 'dog', 'pig', 'ass', 'die', 'fag', 'mf', 'bsdk', 'oc', 'ocu', 'amk', 'pic', 'pd', 'chmo', 'xui', 'bobo', 'gago', 'tanga'
];

export const substringKeywords = [
  // English (Profanity, Slurs, Insults, Threats, Self-Harm)
  'abusive_test', 'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit',
  'bitch', 'asshole', 'cunt', 'whore', 'slut', 'bastard', 'dick', 'dickhead',
  'pussy', 'cock', 'crap', 'nigger', 'nigga', 'fag', 'faggot', 'retard', 'chink',
  'spic', 'kike', 'tranny', 'gook', 'twat', 'wanker', 'wank', 'tosser', 'scum',
  'scumbag', 'idiot', 'stupid', 'dumb', 'moron', 'fool', 'loser', 'pathetic',
  'worthless', 'useless', 'trash', 'freak', 'crazy', 'psycho', 'insane',
  'mental case', 'ugly', 'disgusting', 'shut up', 'kill', 'kill yourself',
  'suicide', 'hate you', 'die', 'go die', 'break your face', 'dog', 'pig',

  // Hindi / Hinglish / Urdu (Indian Subcontinent)
  'bsdk', 'bhosdike', 'bhosada', 'madarchod', 'behenchod', 'bhenchod',
  'chutiya', 'gaandu', 'gandu', 'gand', 'gandmisi', 'kutta', 'kutti',
  'suar', 'harami', 'kamina', 'saala', 'sala', 'randi', 'raand', 'ullu',
  'gadha', 'bhadwe', 'bhadwa', 'rakshas', 'nalayak', 'tatti', 'chus',
  'lodu', 'loda', 'lauda', 'jhantu', 'bhosad', 'chinay', 'kuttiya',

  // Spanish / Latin American
  'puta', 'puto', 'mierda', 'cabron', 'cabrón', 'pendejo', 'pendeja',
  'gilipollas', 'subnormal', 'malparido', 'hijo de puta', 'joder', 'coño',
  'pinche', 'verga', 'maricon', 'maricón', 'culero', 'estupido', 'imbecil',
  'zorra', 'baboso', 'mamahuevo', 'carajo',

  // French
  'merde', 'putain', 'connard', 'conne', 'salope', 'bâtard', 'batard',
  'enculé', 'encule', 'fils de pute', 'bite', 'couille', 'clochard',
  'taré', 'débile', 'abrutis', 'bouffon',

  // German
  'scheiße', 'scheisse', 'arschloch', 'hurensohn', 'ficken', 'schlampe',
  'wichser', 'mistkerl', 'schwein', 'depp', 'missgeburt', 'fotze', 'schwuchtel',

  // Portuguese / Brazilian
  'porra', 'caralho', 'merda', 'filho da puta', 'filha da puta', 'arrombado',
  'babaca', 'otario', 'otário', 'piranha', 'cacete', 'viado', 'bosta', 'corno', 'trouxa',

  // Russian (Cyrillic & Transliterated)
  'cyka', 'suka', 'blyat', 'blia', 'pidaras', 'pidar', 'kurwa', 'gondon', 'mudak', 'eblan', 'zalupa',

  // Arabic (Transliterated)
  'kus ohtak', 'kus omak', 'sharmota', 'sharmouta', 'kalb', 'haywan', 'ahmaq', 'tfeh', 'ibn al kalb', 'manyouk',

  // Italian
  'cazzo', 'vaffanculo', 'stronzo', 'stronza', 'troia', 'puttana', 'figlio di puttana', 'coglione', 'minchia', 'ricchione',

  // Turkish
  'siktir', 'orospu', 'göt', 'ibne', 'yarrak', 'pezevenk', 'hıyar', 'şerefsiz',

  // Tagalog / Filipino
  'putang ina', 'tangina', 'ulol', 'pokpok', 'buwisit', 'hayop', 'leche', 'punyeta',

  // Japanese (Romaji) & Chinese (Pinyin)
  'baka', 'shine', 'kuso', 'yarou', 'chikushou', 'temee', 'sha bi', 'shabi', 'ta ma de', 'tamade', 'cao ni ma', 'caonima', 'jian ren', 'ben dan'
];

export function isContentHarmful(content: string): boolean {
  if (!content) return false;
  const lower = content.toLowerCase();
  
  if (exactWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(content))) {
    return true;
  }
  return substringKeywords.some(kw => lower.includes(kw));
}
