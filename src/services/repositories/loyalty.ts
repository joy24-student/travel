import { supabase } from "../../utils/supabase";

export const loyaltyRepository = {
  // Get loyalty account
  async getLoyaltyAccount(userId: string) {
    const { data, error } = await supabase
      .from("loyalty_accounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create loyalty account
  async createLoyaltyAccount(userId: string) {
    const { data, error } = await supabase
      .from("loyalty_accounts")
      .insert([
        {
          user_id: userId,
          tier: "bronze",
          points_balance: 0,
          lifetime_points: 0,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get loyalty points transactions
  async getPointsTransactions(loyaltyAccountId: string) {
    const { data, error } = await supabase
      .from("loyalty_points_transactions")
      .select("*")
      .eq("loyalty_account_id", loyaltyAccountId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add loyalty points
  async addPoints(
    loyaltyAccountId: string,
    points: number,
    transactionType: string = "earn",
    referenceId?: string,
    description?: string,
  ) {
    const { data, error } = await supabase
      .from("loyalty_points_transactions")
      .insert([
        {
          loyalty_account_id: loyaltyAccountId,
          points_amount: points,
          transaction_type: transactionType,
          reference_id: referenceId,
          description: description,
        },
      ])
      .select();

    if (error) throw error;

    // Update loyalty account balance
    const { data: loyaltyOwner, error: ownerError } = await supabase
      .from("loyalty_accounts")
      .select("user_id")
      .eq("id", loyaltyAccountId)
      .single();

    if (ownerError) throw ownerError;
    if (!loyaltyOwner) throw new Error("Loyalty account not found");

    const account = await this.getLoyaltyAccount(loyaltyOwner.user_id);

    if (account) {
      await supabase
        .from("loyalty_accounts")
        .update({
          points_balance: account.points_balance + points,
          lifetime_points: account.lifetime_points + points,
        })
        .eq("id", loyaltyAccountId);
    }

    return data?.[0];
  },

  // Get available rewards
  async getAvailableRewards() {
    const { data, error } = await supabase
      .from("loyalty_rewards")
      .select("*")
      .eq("is_active", true)
      .order("points_required", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Redeem reward
  async redeemReward(loyaltyAccountId: string, rewardId: string) {
    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from("loyalty_rewards")
      .select("*")
      .eq("id", rewardId)
      .single();

    if (rewardError) throw rewardError;

    // Check if user has enough points
    const { data: loyaltyOwner, error: ownerError } = await supabase
      .from("loyalty_accounts")
      .select("user_id")
      .eq("id", loyaltyAccountId)
      .single();

    if (ownerError) throw ownerError;
    if (!loyaltyOwner) throw new Error("Loyalty account not found");

    const account = await this.getLoyaltyAccount(loyaltyOwner.user_id);

    if (account.points_balance < reward.points_required) {
      throw new Error("Insufficient loyalty points");
    }

    // Create redemption record
    const { data, error } = await supabase
      .from("reward_redemptions")
      .insert([
        {
          loyalty_account_id: loyaltyAccountId,
          reward_id: rewardId,
          redemption_code: `RW-${Date.now()}`,
          status: "active",
          expires_at: new Date(
            Date.now() + reward.expiry_days * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ])
      .select();

    if (error) throw error;

    // Deduct points
    await this.addPoints(
      loyaltyAccountId,
      -reward.points_required,
      "redeem",
      rewardId,
      `Redeemed: ${reward.name}`,
    );

    return data?.[0];
  },

  // Get user's reward redemptions
  async getUserRedemptions(loyaltyAccountId: string) {
    const { data, error } = await supabase
      .from("reward_redemptions")
      .select(
        `
        *,
        reward:reward_id(*)
      `,
      )
      .eq("loyalty_account_id", loyaltyAccountId)
      .eq("status", "active");

    if (error) throw error;
    return data || [];
  },

  // Update loyalty tier (automatic via trigger)
  async updateTier(userId: string) {
    const account = await this.getLoyaltyAccount(userId);

    if (account.lifetime_points >= 500000) {
      await supabase
        .from("loyalty_accounts")
        .update({ tier: "diamond" })
        .eq("user_id", userId);
    } else if (account.lifetime_points >= 100000) {
      await supabase
        .from("loyalty_accounts")
        .update({ tier: "platinum" })
        .eq("user_id", userId);
    } else if (account.lifetime_points >= 50000) {
      await supabase
        .from("loyalty_accounts")
        .update({ tier: "gold" })
        .eq("user_id", userId);
    } else if (account.lifetime_points >= 10000) {
      await supabase
        .from("loyalty_accounts")
        .update({ tier: "silver" })
        .eq("user_id", userId);
    }
  },
};
