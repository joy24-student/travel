import { supabase } from "../../utils/supabase";

export const userRepository = {
  // Get current user profile
  async getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, profile: any) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(profile)
      .eq("id", userId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Create user profile
  async createProfile(userId: string, profile: any) {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert([{ id: userId, ...profile }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get user preferences
  async getPreferences(userId: string) {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user preferences
  async updatePreferences(userId: string, preferences: any) {
    const { data, error } = await supabase
      .from("user_preferences")
      .update(preferences)
      .eq("user_id", userId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get user addresses
  async getAddresses(userId: string) {
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add address
  async addAddress(userId: string, address: any) {
    const { data, error } = await supabase
      .from("user_addresses")
      .insert([{ user_id: userId, ...address }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Update address
  async updateAddress(addressId: string, address: any) {
    const { data, error } = await supabase
      .from("user_addresses")
      .update(address)
      .eq("id", addressId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Delete address
  async deleteAddress(addressId: string) {
    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId);

    if (error) throw error;
  },

  // Get user settings
  async getSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || {};
  },

  // Update individual setting
  async updateSetting(key: string, value: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("user_settings")
      .update({ [key]: value, updated_at: new Date() })
      .eq("user_id", user.id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  // Create payment
  async createPayment(paymentData: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("payments")
      .insert([{ user_id: user.id, ...paymentData }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get user payments
  async getPayments() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get payment by ID
  async getPayment(paymentId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment status
  async updatePaymentStatus(paymentId: string, status: string) {
    const { data, error } = await supabase
      .from("payments")
      .update({ status, updated_at: new Date() })
      .eq("id", paymentId)
      .select();

    if (error) throw error;
    return data?.[0];
  },
};
