import { useCallback } from "react";
import { useMutation, useQuery } from "./useAuth";
import { userRepository } from "../services/repositories/user";

// Hook for user profile
export const useUserProfile = (userId?: string) => {
  const {
    data: profile,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return null;
      return await userRepository.getProfile();
    },
    [userId],
    { enabled: !!userId },
  );

  const updateProfileMutation = useMutation(async (updatedProfile: any) => {
    if (!userId) throw new Error("User ID required");
    return await userRepository.updateProfile(userId, updatedProfile);
  });

  return {
    profile,
    loading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    updating: updateProfileMutation.loading,
  };
};

// Hook for user preferences
export const useUserPreferences = (userId?: string) => {
  const {
    data: preferences,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return null;
      return await userRepository.getPreferences(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  const updatePreferencesMutation = useMutation(
    async (updatedPreferences: any) => {
      if (!userId) throw new Error("User ID required");
      return await userRepository.updatePreferences(userId, updatedPreferences);
    },
  );

  return {
    preferences,
    loading,
    error,
    refetch,
    updatePreferences: updatePreferencesMutation.mutate,
    updating: updatePreferencesMutation.loading,
  };
};

// Hook for user addresses
export const useUserAddresses = (userId?: string) => {
  const {
    data: addresses,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await userRepository.getAddresses(userId);
    },
    [userId],
    { enabled: !!userId },
  );

  const addAddressMutation = useMutation(async (address: any) => {
    if (!userId) throw new Error("User ID required");
    return await userRepository.addAddress(userId, address);
  });

  const updateAddressMutation = useMutation(
    async ({ id, address }: { id: string; address: any }) => {
      return await userRepository.updateAddress(id, address);
    },
  );

  const deleteAddressMutation = useMutation(async (id: string) => {
    await userRepository.deleteAddress(id);
  });

  return {
    addresses: addresses || [],
    loading,
    error,
    refetch,
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isAdding: addAddressMutation.loading,
    isUpdating: updateAddressMutation.loading,
    isDeleting: deleteAddressMutation.loading,
  };
};
