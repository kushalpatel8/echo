import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';

async function enrichChat(chatDoc: any) {
  const chatObj = chatDoc.toObject ? chatDoc.toObject() : { ...chatDoc._doc || chatDoc };
  if (!chatObj.helperId || (!chatObj.doctorId && chatObj.helperRole === 'doctor')) {
    const users = await User.find({ clerkId: { $in: chatObj.participants } });
    const helper = users.find(u => u.role === 'doctor' || u.role === 'volunteer');
    const patient = users.find(u => u.role !== 'doctor' && u.role !== 'volunteer') || users[0];

    if (helper) {
      chatObj.helperId = helper.clerkId;
      chatObj.helperName = helper.name;
      chatObj.helperRole = helper.role;
      if (helper.role === 'doctor') chatObj.doctorId = helper.clerkId;
      if (helper.role === 'volunteer') chatObj.volunteerId = helper.clerkId;
    }
    if (patient) {
      chatObj.userId = patient.clerkId;
      chatObj.userName = patient.name;
    }

    if (chatDoc.save && helper) {
      chatDoc.helperId = chatObj.helperId;
      chatDoc.helperName = chatObj.helperName;
      chatDoc.helperRole = chatObj.helperRole;
      chatDoc.doctorId = chatObj.doctorId;
      chatDoc.volunteerId = chatObj.volunteerId;
      chatDoc.userId = chatObj.userId;
      chatDoc.userName = chatObj.userName;
      await chatDoc.save().catch(() => {});
    }
  }
  return chatObj;
}

function isMessageHarmful(content: string): boolean {
  if (!content) return false;
  const lower = content.toLowerCase();
  
  const exactWords = [
    'mc', 'bc', 'dog', 'pig', 'ass', 'die', 'fag', 'mf', 'bsdk', 'oc', 'ocu', 'amk', 'pic', 'pd', 'chmo', 'xui', 'bobo', 'gago', 'tanga'
  ];

  const substringKeywords = [
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

  if (exactWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(content))) {
    return true;
  }
  return substringKeywords.some(kw => lower.includes(kw));
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  await connectDB();

  if (chatId) {
    const chat = await Chat.findById(chatId);
    if (!chat?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const enriched = await enrichChat(chat);
    return NextResponse.json({ chat: enriched });
  }

  const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
  const enrichedChats = await Promise.all(chats.map(c => enrichChat(c)));
  return NextResponse.json({ chats: enrichedChats });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, chatId, content, targetUserId } = body;

  await connectDB();

  const sender = await User.findOne({ clerkId: userId });
  if (!sender) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (action === 'create') {
    if (sender.isBanned) {
      return NextResponse.json({ error: '🚫 You are currently banned from initiating chat sessions.', isBanned: true }, { status: 403 });
    }
    const target = await User.findOne({ clerkId: targetUserId });
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    if (target.isBanned) {
      return NextResponse.json({ error: '🚫 This doctor is currently banned and unavailable for chat sessions.', isBanned: true }, { status: 403 });
    }

    const existingChat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] }
    });
    if (existingChat) {
      const enriched = await enrichChat(existingChat);
      return NextResponse.json({ chat: enriched });
    }

    const chat = await Chat.create({
      participants: [userId, targetUserId],
      participantNames: [sender.name, target.name],
      userId: userId,
      userName: sender.name,
      helperId: targetUserId,
      helperName: target.name,
      helperRole: target.role,
      doctorId: target.role === 'doctor' ? targetUserId : undefined,
      volunteerId: target.role === 'volunteer' ? targetUserId : undefined,
      messages: [],
    });
    const enriched = await enrichChat(chat);
    return NextResponse.json({ chat: enriched });
  }

  if (action === 'send') {
    const chat = await Chat.findById(chatId);
    if (!chat?.participants.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (sender.role !== 'admin') {
      if (sender.isBanned) {
        return NextResponse.json({
          error: '🚫 You are currently banned from sending messages due to previous policy violations. Please contact Admin from your dashboard to appeal.',
          isBanned: true
        }, { status: 403 });
      }

      if (isMessageHarmful(content)) {
        const currentWarnings = sender.warningCount || 0;
        const newWarnings = currentWarnings + 1;
        const shouldBan = newWarnings >= 3;

        await User.findOneAndUpdate(
          { clerkId: userId },
          { $set: { warningCount: newWarnings, isBanned: shouldBan } },
          { strict: false }
        );

        if (shouldBan) {
          return NextResponse.json({
            error: '🚫 ACCOUNT BANNED (3rd Offense): You have been banned for repeated abusive or emotionally harmful messaging. You can no longer chat with users. You may contact Admin from your dashboard to appeal this ban.',
            warningCount: 3,
            isBanned: true
          }, { status: 403 });
        } else if (newWarnings === 2) {
          return NextResponse.json({
            error: '🚨 STRONG WARNING (2nd Offense): Your message contained abusive or emotionally harmful language! One more violation will result in an automatic account ban.',
            warningCount: 2,
            isBanned: false
          }, { status: 400 });
        } else {
          return NextResponse.json({
            error: '⚠️ FIRST WARNING: Your message was blocked for containing abusive or emotionally harmful language. Please communicate with empathy and respect.',
            warningCount: 1,
            isBanned: false
          }, { status: 400 });
        }
      }
    }

    chat.messages.push({
      senderId: userId,
      senderName: sender.name,
      content,
      timestamp: new Date(),
    });
    await chat.save();
    const enriched = await enrichChat(chat);
    return NextResponse.json({ success: true, chat: enriched });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });

  await connectDB();

  const chat = await Chat.findById(chatId);
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

  if (!chat.participants.includes(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Chat.findByIdAndDelete(chatId);
  return NextResponse.json({ success: true });
}
