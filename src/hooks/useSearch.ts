import { useCallback } from "react";
import { useMutation, useQuery } from "./useAuth";
import { searchRepository } from "../services/repositories/search";

// Hook for searching hotels
export const useSearchHotels = (filters?: any) => {
  const {
    data: hotels,
    loading,
    error,
    refetch,
  } = useQuery(async () => {
    if (!filters) return [];
    return await searchRepository.searchHotels(filters);
  }, [filters]);

  return {
    hotels: hotels || [],
    loading,
    error,
    refetch,
  };
};

// Hook for hotel details
export const useHotel = (hotelId?: string) => {
  const {
    data: hotel,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!hotelId) return null;
      return await searchRepository.getHotel(hotelId);
    },
    [hotelId],
    { enabled: !!hotelId },
  );

  return {
    hotel,
    loading,
    error,
    refetch,
  };
};

// Hook for searching flights
export const useSearchFlights = (filters?: any) => {
  const {
    data: flights,
    loading,
    error,
    refetch,
  } = useQuery(async () => {
    if (!filters) return [];
    return await searchRepository.searchFlights(filters);
  }, [filters]);

  return {
    flights: flights || [],
    loading,
    error,
    refetch,
  };
};

// Hook for flight details
export const useFlight = (flightId?: string) => {
  const {
    data: flight,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!flightId) return null;
      return await searchRepository.getFlight(flightId);
    },
    [flightId],
    { enabled: !!flightId },
  );

  return {
    flight,
    loading,
    error,
    refetch,
  };
};

// Hook for searching tours
export const useSearchTours = (filters?: any) => {
  const {
    data: tours,
    loading,
    error,
    refetch,
  } = useQuery(async () => {
    if (!filters) return [];
    return await searchRepository.searchTours(filters);
  }, [filters]);

  return {
    tours: tours || [],
    loading,
    error,
    refetch,
  };
};

// Hook for tour details
export const useTour = (tourId?: string) => {
  const {
    data: tour,
    loading,
    error,
    refetch,
  } = useQuery(
    async () => {
      if (!tourId) return null;
      return await searchRepository.getTour(tourId);
    },
    [tourId],
    { enabled: !!tourId },
  );

  return {
    tour,
    loading,
    error,
    refetch,
  };
};

// Hook for airports
export const useAirports = () => {
  const {
    data: airports,
    loading,
    error,
  } = useQuery(async () => await searchRepository.getAirports());

  const searchMutation = useMutation(
    async (query: string) => await searchRepository.searchAirports(query),
  );

  return {
    airports: airports || [],
    loading,
    error,
    searchAirports: searchMutation.mutate,
    searchResults: searchMutation.data || [],
    isSearching: searchMutation.loading,
  };
};
