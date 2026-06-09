import { supabase } from "./supabaseClient";

export interface AgencyProfile {
  id: string;
  owner_user_id: string;
  name: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  description?: string | null;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  status: "active" | "inactive" | "suspended";
  rating: number;
}

export interface AgencyMetrics {
  totalRevenue: number;
  totalBookings: number;
  activeCustomers: number;
  conversionRate: number;
  revenueGrowth: number;
  bookingGrowth: number;
  customerGrowth: number;
  avgOrderValue: number;
}

export interface AgencyBooking {
  id: string;
  booking_reference: string;
  product_type: string;
  status: string;
  destination_city: string;
  destination_country?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  number_of_guests: number;
  final_price: number;
  currency: string;
  user_id: string;
  created_at: string;
  traveler_details?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

const emptyMetrics: AgencyMetrics = {
  totalRevenue: 0,
  totalBookings: 0,
  activeCustomers: 0,
  conversionRate: 0,
  revenueGrowth: 0,
  bookingGrowth: 0,
  customerGrowth: 0,
  avgOrderValue: 0,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected Supabase error";
}

export const agencyIdentityService = {
  async getCurrentAgency(userId: string): Promise<AgencyProfile | null> {
    const owned = await supabase
      .from("agencies")
      .select("*")
      .eq("owner_user_id", userId)
      .limit(1)
      .maybeSingle();

    if (owned.error) {
      console.warn("Owned agency lookup failed:", owned.error.message);
    }

    if (owned.data) {
      return owned.data as AgencyProfile;
    }

    const member = await supabase
      .from("agency_team_members")
      .select("agencies(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (member.error) {
      console.warn("Team agency lookup failed:", member.error.message);
      return null;
    }

    const agency = Array.isArray(member.data?.agencies)
      ? member.data?.agencies[0]
      : member.data?.agencies;

    return (agency as AgencyProfile | undefined) || null;
  },
};

export const agencyDashboardService = {
  async getMetrics(agencyId: string): Promise<AgencyMetrics> {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, status, final_price, user_id")
      .eq("agency_id", agencyId);

    if (error) {
      console.warn("Dashboard metrics error:", error.message);
      return emptyMetrics;
    }

    const bookings = data || [];
    const completed = bookings.filter((booking) =>
      ["confirmed", "completed"].includes(String(booking.status)),
    );
    const totalRevenue = completed.reduce(
      (sum, booking) => sum + Number(booking.final_price || 0),
      0,
    );
    const customerIds = new Set(
      bookings.map((booking) => booking.user_id).filter(Boolean),
    );

    return {
      ...emptyMetrics,
      totalRevenue,
      totalBookings: bookings.length,
      activeCustomers: customerIds.size,
      conversionRate: bookings.length
        ? Math.round((completed.length / bookings.length) * 1000) / 10
        : 0,
      avgOrderValue: completed.length
        ? Math.round(totalRevenue / completed.length)
        : 0,
    };
  },

  async getRecentActivity(agencyId: string, limit = 10) {
    const { data, error } = await supabase
      .from("agency_activity_logs")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Activity fetch error:", error.message);
      return [];
    }

    return data || [];
  },
};

export const agencyBookingsService = {
  async getBookings(
    agencyId: string,
    status?: string,
  ): Promise<AgencyBooking[]> {
    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        booking_reference,
        product_type,
        status,
        destination_city,
        destination_country,
        start_date,
        end_date,
        number_of_guests,
        final_price,
        currency,
        user_id,
        created_at,
        traveler_details(first_name,last_name,email)
      `,
      )
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Bookings fetch error:", error.message);
      return [];
    }

    return (data || []).map((booking: any) => ({
      ...booking,
      traveler_details: Array.isArray(booking.traveler_details)
        ? booking.traveler_details[0] || null
        : booking.traveler_details || null,
    })) as AgencyBooking[];
  },

  async updateBookingStatus(
    agencyId: string,
    bookingId: string,
    status: string,
  ) {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .eq("agency_id", agencyId)
      .select()
      .single();

    if (error) throw new Error(getErrorMessage(error));
    await this.logActivity(
      agencyId,
      "booking_updated",
      `Booking ${bookingId} changed to ${status}`,
    );
    return data;
  },

  async logActivity(agencyId: string, action: string, details: string) {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("agency_activity_logs").insert({
      agency_id: agencyId,
      actor_user_id: userData.user?.id,
      action,
      details,
    });
  },
};

export const agencyCustomersService = {
  async getCustomers(agencyId: string) {
    const bookings = await agencyBookingsService.getBookings(agencyId);
    const customers = new Map<string, any>();

    bookings.forEach((booking) => {
      const traveler = booking.traveler_details;
      const name = traveler
        ? `${traveler.first_name} ${traveler.last_name}`.trim()
        : `Customer ${booking.user_id.slice(0, 6)}`;
      const existing = customers.get(booking.user_id) || {
        id: booking.user_id,
        name,
        email: traveler?.email,
        bookings: 0,
        spent: 0,
        vip: false,
      };

      existing.bookings += 1;
      existing.spent += Number(booking.final_price || 0);
      existing.vip = existing.spent >= 10000 || existing.bookings >= 5;
      customers.set(booking.user_id, existing);
    });

    return Array.from(customers.values()).sort((a, b) => b.spent - a.spent);
  },
};

export const agencyMessagesService = {
  async getMessages(agencyId: string) {
    const { data, error } = await supabase
      .from("agency_messages")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Messages fetch error:", error.message);
      return [];
    }

    return data || [];
  },

  async sendMessage(
    agencyId: string,
    recipientUserId: string,
    content: string,
    subject?: string,
  ) {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("agency_messages")
      .insert({
        agency_id: agencyId,
        sender_user_id: userData.user?.id,
        recipient_user_id: recipientUserId,
        subject,
        content,
      })
      .select()
      .single();

    if (error) throw new Error(getErrorMessage(error));
    return data;
  },
};

export const agencyProfileService = {
  async getProfile(agencyId: string) {
    const { data, error } = await supabase
      .from("agencies")
      .select("*")
      .eq("id", agencyId)
      .single();
    if (error) throw new Error(getErrorMessage(error));
    return data as AgencyProfile;
  },

  async updateProfile(agencyId: string, updates: Partial<AgencyProfile>) {
    const { data, error } = await supabase
      .from("agencies")
      .update(updates)
      .eq("id", agencyId)
      .select()
      .single();

    if (error) throw new Error(getErrorMessage(error));
    return data as AgencyProfile;
  },

  async getTeamMembers(agencyId: string) {
    const { data, error } = await supabase
      .from("agency_team_members")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Team members fetch error:", error.message);
      return [];
    }

    return data || [];
  },
};

export const agencyPaymentsService = {
  async getBankAccounts(agencyId: string) {
    const { data, error } = await supabase
      .from("agency_bank_accounts")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Bank accounts fetch error:", error.message);
      return [];
    }

    return data || [];
  },
};

export const agencyVerificationService = {
  async getDocuments(agencyId: string) {
    const { data, error } = await supabase
      .from("agency_documents")
      .select("*")
      .eq("agency_id", agencyId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.warn("Documents fetch error:", error.message);
      return [];
    }

    return (data || []).map((document: any) => ({
      ...document,
      name: document.document_type || document.name || "Document",
      status: document.verification_status || document.status || "pending",
      uploadDate: document.uploaded_at || document.created_at,
      r2_url:
        document.document_file_url || document.file_url || document.r2_url,
    }));
  },

  async uploadDocument(agencyId: string, docData: any) {
    const { data, error } = await supabase
      .from("agency_documents")
      .insert({
        agency_id: agencyId,
        document_type: docData.document_type,
        document_file_url: docData.document_file_url || docData.file_url,
        verification_status: docData.verification_status || "pending",
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(getErrorMessage(error));
    await agencyBookingsService.logActivity(
      agencyId,
      "document_uploaded",
      `Document uploaded: ${docData.document_type}`,
    );

    return data;
  },
};
