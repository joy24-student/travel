import { supabase } from "../../utils/supabase";

export const supportRepository = {
  // Get user's support tickets
  async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(
        `
        *,
        messages:ticket_messages(*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get ticket by ID
  async getTicket(ticketId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(
        `
        *,
        messages:ticket_messages(*)
      `,
      )
      .eq("id", ticketId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create support ticket
  async createTicket(userId: string, ticket: any) {
    const { data, error } = await supabase
      .from("support_tickets")
      .insert([
        {
          user_id: userId,
          ...ticket,
          ticket_number: `TK-${Date.now()}`,
          status: "open",
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Update ticket status
  async updateTicketStatus(ticketId: string, status: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .update({
        status,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", ticketId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Add message to ticket
  async addTicketMessage(
    ticketId: string,
    userId: string,
    message: string,
    isInternal = false,
  ) {
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert([
        {
          ticket_id: ticketId,
          user_id: userId,
          message,
          is_internal: isInternal,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get FAQ
  async getFAQ(filters?: { category?: string; search?: string }) {
    let query = supabase.from("faq").select("*").eq("is_published", true);

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `question.ilike.%${filters.search}%,answer.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query.order("display_order", {
      ascending: true,
    });

    if (error) throw error;
    return data || [];
  },

  // Get FAQ categories
  async getFAQCategories() {
    const { data, error } = await supabase
      .from("faq")
      .select("category")
      .eq("is_published", true);

    if (error) throw error;
    return [
      ...new Set(
        (data || []).map((item: any) => item.category).filter(Boolean),
      ),
    ];
  },

  // Mark FAQ as helpful
  async markFAQHelpful(faqId: string) {
    const { data, error } = await supabase
      .from("faq")
      .select("helpful_count")
      .eq("id", faqId)
      .single();

    if (error) throw error;

    const { error: updateError } = await supabase
      .from("faq")
      .update({ helpful_count: (data?.helpful_count || 0) + 1 })
      .eq("id", faqId);

    if (updateError) throw updateError;
  },

  // Mark FAQ as unhelpful
  async markFAQUnhelpful(faqId: string) {
    const { data, error } = await supabase
      .from("faq")
      .select("unhelpful_count")
      .eq("id", faqId)
      .single();

    if (error) throw error;

    const { error: updateError } = await supabase
      .from("faq")
      .update({ unhelpful_count: (data?.unhelpful_count || 0) + 1 })
      .eq("id", faqId);

    if (updateError) throw updateError;
  },
};
