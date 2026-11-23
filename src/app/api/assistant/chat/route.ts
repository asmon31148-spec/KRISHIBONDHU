import { NextRequest, NextResponse } from 'next/server';
import { generateChatReply, FarmerContext, ChatMessageParam } from '@/lib/ai/chat';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'en', conversationId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    let farmerContext: FarmerContext | undefined;
    let userId: string | null = null;
    let supabase = null;

    try {
      supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          userId = user.id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, state, district, village, primary_crops, soil_type')
            .eq('id', user.id)
            .single();

          if (profile) {
            farmerContext = {
              name: profile.full_name || undefined,
              state: profile.state || undefined,
              district: profile.district || undefined,
              village: profile.village || undefined,
              crops: profile.primary_crops || undefined,
              soilType: profile.soil_type || undefined,
            };
          }
        }
      }
    } catch (authErr) {
      console.warn('Chat user lookup skipped:', authErr);
    }

    // Generate response from AI model
    const reply = await generateChatReply(
      messages as ChatMessageParam[],
      language as 'en' | 'bn' | 'hi',
      farmerContext
    );

    let activeConvId = conversationId;

    // Automatically create conversation and persist messages if user is authenticated
    if (supabase && userId) {
      const lastUserMsg = messages[messages.length - 1];

      try {
        // If no conversationId was provided, auto-create a conversation
        if (!activeConvId) {
          const autoTitle =
            lastUserMsg.content.trim().slice(0, 48) || 'Agricultural Inquiry';
          const { data: newConv } = await supabase
            .from('chat_conversations')
            .insert({
              user_id: userId,
              title: autoTitle,
              language,
            })
            .select()
            .single();

          if (newConv) {
            activeConvId = newConv.id;
          }
        }

        if (activeConvId) {
          await supabase.from('chat_messages').insert([
            {
              conversation_id: activeConvId,
              user_id: userId,
              role: 'user',
              content: lastUserMsg.content,
              image_url: lastUserMsg.imageUrl || null,
            },
            {
              conversation_id: activeConvId,
              user_id: userId,
              role: 'assistant',
              content: reply,
            },
          ]);

          await supabase
            .from('chat_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', activeConvId);
        }
      } catch (dbErr) {
        console.warn('Failed to persist chat messages:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      conversationId: activeConvId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Chat assistant failed.';
    console.error('Chat API error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
