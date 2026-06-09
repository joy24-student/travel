import { useCallback } from "react";
import { useMutation, useQuery } from "./useAuth";
import { bookingRepository } from "../services/repositories/booking";

// Hook for user bookings
export const useUserBookings = (userId?: string, status?: string) => {
  const {
    data: bookings,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!userId) return [];
      return await bookingRepository.getUserBookings(userId, status);
    },
    [userId, status],
    { enabled: !!userId },
  );

  return {
    bookings: bookings || [],
    loading,
    error,
    refetch,
  };
};

// Hook for single booking
export const useBooking = (bookingId?: string) => {
  const {
    data: booking,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!bookingId) return null;
      return await bookingRepository.getBooking(bookingId);
    },
    [bookingId],
    { enabled: !!bookingId },
  );

  return {
    booking,
    loading,
    error,
    refetch,
  };
};

// Hook for creating bookings
export const useCreateBooking = () => {
  const createMutation = useMutation(
    async ({ userId, booking }: { userId: string; booking: any }) => {
      return await bookingRepository.createBooking(userId, booking);
    },
  );

  return {
    createBooking: createMutation.mutate,
    loading: createMutation.loading,
    error: createMutation.error,
    data: createMutation.data,
  };
};

// Hook for booking mutations
export const useBookingMutations = (bookingId: string) => {
  const confirmMutation = useMutation(
    async () => await bookingRepository.confirmBooking(bookingId),
  );

  const cancelMutation = useMutation(
    async (reason: string) =>
      await bookingRepository.cancelBooking(bookingId, reason),
  );

  const addPassengerMutation = useMutation(
    async (passenger: any) =>
      await bookingRepository.addPassenger(bookingId, passenger),
  );

  const createPaymentMutation = useMutation(
    async (payment: any) =>
      await bookingRepository.createPayment(bookingId, payment),
  );

  const refundMutation = useMutation(
    async ({ userId, refund }: { userId: string; refund: any }) =>
      await bookingRepository.requestRefund(bookingId, userId, refund),
  );

  const timelineMutation = useMutation(
    async ({ userId, event }: { userId: string; event: any }) =>
      await bookingRepository.addTimelineEvent(bookingId, userId, event),
  );

  return {
    confirm: confirmMutation.mutate,
    cancel: cancelMutation.mutate,
    addPassenger: addPassengerMutation.mutate,
    createPayment: createPaymentMutation.mutate,
    requestRefund: refundMutation.mutate,
    addTimelineEvent: timelineMutation.mutate,
    isConfirming: confirmMutation.loading,
    isCancelling: cancelMutation.loading,
    isAddingPassenger: addPassengerMutation.loading,
    isCreatingPayment: createPaymentMutation.loading,
    isRequestingRefund: refundMutation.loading,
    isAddingTimelineEvent: timelineMutation.loading,
  };
};

export const useCompleteBookingFlow = () => {
  const flowMutation = useMutation(
    async ({ userId, payload }: { userId: string; payload: any }) =>
      await bookingRepository.completeBookingFlow(userId, payload),
  );

  return {
    completeBookingFlow: flowMutation.mutate,
    loading: flowMutation.loading,
    error: flowMutation.error,
    data: flowMutation.data,
  };
};

export const useTripTimeline = (bookingId?: string) => {
  const {
    data: timeline,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!bookingId) return [];
      return await bookingRepository.getTimeline(bookingId);
    },
    [bookingId],
    { enabled: !!bookingId },
  );

  return {
    timeline: timeline || [],
    loading,
    error,
    refetch,
  };
};
