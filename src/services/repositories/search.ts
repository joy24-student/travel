import { supabase } from "../../utils/supabase";

export const searchRepository = {
  // Search hotels
  async searchHotels(filters: {
    city?: string;
    country?: string;
    checkInDate?: string;
    checkOutDate?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  }) {
    let query = supabase.from("hotels").select("*");

    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters.country) {
      query = query.eq("country_code", filters.country);
    }
    if (filters.minRating) {
      query = query.gte("average_rating", filters.minRating);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data || [];
  },

  // Get hotel details
  async getHotel(hotelId: string) {
    const { data, error } = await supabase
      .from("hotels")
      .select(
        `
        *,
        hotel_rooms(*),
        hotel_reviews(*)
      `,
      )
      .eq("id", hotelId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get hotel rooms availability
  async getHotelRoomAvailability(
    roomId: string,
    checkInDate: string,
    checkOutDate: string,
  ) {
    const { data, error } = await supabase
      .from("hotel_room_availability")
      .select("*")
      .eq("room_id", roomId)
      .gte("check_in_date", checkInDate)
      .lte("check_out_date", checkOutDate);

    if (error) throw error;
    return data || [];
  },

  // Search flights
  async searchFlights(filters: {
    departureAirportId?: string;
    arrivalAirportId?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    let query = supabase.from("flights").select(`
      *,
      departure_airport:airports!departure_airport_id(*),
      arrival_airport:airports!arrival_airport_id(*),
      airline:airlines(*)
    `);

    if (filters.departureAirportId) {
      query = query.eq("departure_airport_id", filters.departureAirportId);
    }
    if (filters.arrivalAirportId) {
      query = query.eq("arrival_airport_id", filters.arrivalAirportId);
    }
    if (filters.departureDate) {
      query = query.gte("departure_time", filters.departureDate);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data || [];
  },

  // Get flight details
  async getFlight(flightId: string) {
    const { data, error } = await supabase
      .from("flights")
      .select(
        `
        *,
        departure_airport:airports!departure_airport_id(*),
        arrival_airport:airports!arrival_airport_id(*),
        airline:airlines(*)
      `,
      )
      .eq("id", flightId)
      .single();

    if (error) throw error;
    return data;
  },

  // Search tours
  async searchTours(filters: {
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
    difficultyLevel?: string;
  }) {
    let query = supabase.from("tours").select("*");

    if (filters.destination) {
      query = query.ilike("destination_city", `%${filters.destination}%`);
    }
    if (filters.difficultyLevel) {
      query = query.eq("difficulty_level", filters.difficultyLevel);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data || [];
  },

  // Get tour details
  async getTour(tourId: string) {
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tourId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get airports
  async getAirports() {
    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  // Search airports
  async searchAirports(query: string) {
    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .or(`iata_code.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },
};
