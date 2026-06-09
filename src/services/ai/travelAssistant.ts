import { supabase } from "../../utils/supabase";
import { chat } from "./llm";
import type { AssistantMessage, AssistantSession, ChatMessage } from "./types";

const SYSTEM = `You are an intelligent AI travel assistant for a travel booking app.
You help users plan trips, find hotels, book flights, manage bookings, answer travel questions,
and provide destination insights. Be helpful, concise, and friendly.
When relevant, reference the user's booking context provided.`;

export const travelAssistantService = {
  async createSession(
    userId: string,
    context: Record<string, unknown> = {},
  ): Promise<AssistantSession> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert([{ user_id: userId, context, messages: [] }])
      .select()
      .single();

    if (error) throw error;

    return {
      sessionId: data.id,
      userId,
      context,
      messages: [],
    };
  },

  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
  ): Promise<AssistantMessage> {
    // Load conversation history
    const { data: session, error: fetchError } = await supabase
      .from("ai_conversations")
      .select("messages, context")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    const history: AssistantMessage[] = session.messages ?? [];
    const context = session.context ?? {};

    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Build messages for LLM
    const contextNote = Object.keys(context).length
      ? `User context: ${JSON.stringify(context)}`
      : "";

    const llmMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM },
      ...(contextNote
        ? [{ role: "system" as const, content: contextNote }]
        : []),
      // Keep last 10 exchanges to stay within token limits
      ...history
        .slice(-20)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      { role: "user", content },
    ];

    const result = await chat(llmMessages, 0.8);

    const assistantMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.raw.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...history, userMsg, assistantMsg];

    await supabase
      .from("ai_conversations")
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return assistantMsg;
  },

  async getSession(
    sessionId: string,
    userId: string,
  ): Promise<AssistantSession | null> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error) return null;

    return {
      sessionId: data.id,
      userId: data.user_id,
      context: data.context,
      messages: data.messages ?? [],
    };
  },

  async getUserSessions(userId: string): Promise<AssistantSession[]> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, user_id, context, messages, created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data ?? []).map((d) => ({
      sessionId: d.id,
      userId: d.user_id,
      context: d.context,
      messages: d.messages ?? [],
    }));
  },

  async updateContext(
    sessionId: string,
    userId: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    await supabase
      .from("ai_conversations")
      .update({ context })
      .eq("id", sessionId)
      .eq("user_id", userId);
  },

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);
  },
};
