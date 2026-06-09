import { useCallback } from "react";
import { useMutation, useQuery } from "./useAuth";
import { loyaltyRepository } from "../services/repositories/loyalty";
import { supportRepository } from "../services/repositories/support";

// ============= LOYALTY HOOKS =============

// Hook for loyalty account
export const useLoyaltyAccount = (userId?: string) => {
  const {
    data: account,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return null;
      try {
        return await loyaltyRepository.getLoyaltyAccount(userId);
      } catch (err) {
        // Create account if it doesn't exist
        return await loyaltyRepository.createLoyaltyAccount(userId);
      }
    },
    [userId],
    { enabled: !!userId },
  );

  return {
    account,
    loading,
    error,
    refetch,
  };
};

// Hook for loyalty points
export const useLoyaltyPoints = (loyaltyAccountId?: string) => {
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!loyaltyAccountId) return [];
      return await loyaltyRepository.getPointsTransactions(loyaltyAccountId);
    },
    [loyaltyAccountId],
    { enabled: !!loyaltyAccountId },
  );

  return {
    transactions: transactions || [],
    loading,
    error,
    refetch,
  };
};

// Hook for rewards
export const useAvailableRewards = () => {
  const {
    data: rewards,
    loading,
    error,
    refetch,
  } = useQuery(async () => await loyaltyRepository.getAvailableRewards());

  return {
    rewards: rewards || [],
    loading,
    error,
    refetch,
  };
};

// Hook for redeeming rewards
export const useRedeemReward = (loyaltyAccountId?: string) => {
  const redeemMutation = useMutation(async (rewardId: string) => {
    if (!loyaltyAccountId) throw new Error("Loyalty account ID required");
    return await loyaltyRepository.redeemReward(loyaltyAccountId, rewardId);
  });

  return {
    redeem: redeemMutation.mutate,
    loading: redeemMutation.loading,
    error: redeemMutation.error,
    data: redeemMutation.data,
  };
};

// Hook for user's reward redemptions
export const useUserRedemptions = (loyaltyAccountId?: string) => {
  const {
    data: redemptions,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!loyaltyAccountId) return [];
      return await loyaltyRepository.getUserRedemptions(loyaltyAccountId);
    },
    [loyaltyAccountId],
    { enabled: !!loyaltyAccountId },
  );

  return {
    redemptions: redemptions || [],
    loading,
    error,
    refetch,
  };
};

// ============= SUPPORT HOOKS =============

// Hook for user's support tickets
export const useUserTickets = (userId?: string) => {
  const {
    data: tickets,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await supportRepository.getUserTickets(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  return {
    tickets: tickets || [],
    loading,
    error,
    refetch,
  };
};

// Hook for single ticket
export const useTicket = (ticketId?: string) => {
  const {
    data: ticket,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!ticketId) return null;
      return await supportRepository.getTicket(ticketId);
    },
    [ticketId],
    { enabled: !!ticketId },
  );

  return {
    ticket,
    loading,
    error,
    refetch,
  };
};

// Hook for creating support tickets
export const useCreateTicket = (userId?: string) => {
  const createMutation = useMutation(async (ticket: any) => {
    if (!userId) throw new Error("User ID required");
    return await supportRepository.createTicket(userId, ticket);
  });

  return {
    createTicket: createMutation.mutate,
    loading: createMutation.loading,
    error: createMutation.error,
    data: createMutation.data,
  };
};

// Hook for ticket interactions
export const useTicketInteractions = (ticketId: string, userId?: string) => {
  const updateStatusMutation = useMutation(
    async (status: string) =>
      await supportRepository.updateTicketStatus(ticketId, status),
  );

  const addMessageMutation = useMutation(async (message: string) => {
    if (!userId) throw new Error("User ID required");
    return await supportRepository.addTicketMessage(ticketId, userId, message);
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    addMessage: addMessageMutation.mutate,
    isUpdatingStatus: updateStatusMutation.loading,
    isAddingMessage: addMessageMutation.loading,
  };
};

// Hook for FAQ
export const useFAQ = (filters?: any) => {
  const {
    data: faqItems,
    loading,
    error,
    refetch,
  } = useQuery(async () => await supportRepository.getFAQ(filters), [filters]);

  const { data: categories, loading: categoriesLoading } = useQuery(
    async () => await supportRepository.getFAQCategories(),
  );

  const markHelpfulMutation = useMutation(
    async (faqId: string) => await supportRepository.markFAQHelpful(faqId),
  );

  const markUnhelpfulMutation = useMutation(
    async (faqId: string) => await supportRepository.markFAQUnhelpful(faqId),
  );

  return {
    faqItems: faqItems || [],
    categories: categories || [],
    loading,
    categoriesLoading,
    error,
    refetch,
    markHelpful: markHelpfulMutation.mutate,
    markUnhelpful: markUnhelpfulMutation.mutate,
    isMarkingHelpful: markHelpfulMutation.loading,
    isMarkingUnhelpful: markUnhelpfulMutation.loading,
  };
};
