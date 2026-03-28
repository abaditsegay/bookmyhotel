import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { hotelApiService } from '../services/hotelApi';
import { HotelSearchRequest, HotelSearchResult } from '../types/hotel';

export interface PublicHotelSearchLocationState {
  searchRequest?: HotelSearchRequest;
  hotels?: HotelSearchResult[];
  successMessage?: string;
}

interface HotelSearchSummaryLabels {
  inLabel: string;
  fromLabel: string;
  toLabel: string;
  forLabel: string;
  guestSingular: string;
  guestPlural: string;
}

const defaultSummaryLabels: HotelSearchSummaryLabels = {
  inLabel: 'in',
  fromLabel: 'from',
  toLabel: 'to',
  forLabel: 'for',
  guestSingular: 'guest',
  guestPlural: 'guests',
};

export const formatHotelSearchSummary = (
  searchRequest: HotelSearchRequest | null,
  labels: HotelSearchSummaryLabels = defaultSummaryLabels,
): string => {
  if (!searchRequest) {
    return '';
  }

  const parts = [];
  if (searchRequest.location) {
    parts.push(`${labels.inLabel} ${searchRequest.location}`);
  }
  parts.push(`${labels.fromLabel} ${searchRequest.checkInDate} ${labels.toLabel} ${searchRequest.checkOutDate}`);
  parts.push(`${labels.forLabel} ${searchRequest.guests} ${searchRequest.guests > 1 ? labels.guestPlural : labels.guestSingular}`);

  return parts.join(' ');
};

export const usePublicHotelSearchResults = (locationState: PublicHotelSearchLocationState | null | undefined) => {
  const searchRequest = locationState?.searchRequest ?? null;
  const seededHotels = useMemo(() => locationState?.hotels ?? [], [locationState?.hotels]);
  const successMessage = locationState?.successMessage ?? '';
  const hasSeededHotels = seededHotels.length > 0;

  const query = useQuery<HotelSearchResult[]>({
    queryKey: [
      'public-hotel-search-results',
      searchRequest?.location ?? '',
      searchRequest?.checkInDate ?? '',
      searchRequest?.checkOutDate ?? '',
      searchRequest?.guests ?? 0,
    ],
    enabled: Boolean(searchRequest) && !hasSeededHotels,
    queryFn: () => hotelApiService.searchHotelsPublic(searchRequest as HotelSearchRequest),
    initialData: hasSeededHotels ? seededHotels : undefined,
  });

  return {
    searchRequest,
    hotels: query.data ?? seededHotels,
    successMessage,
    isLoading: query.isLoading,
    error: query.error,
    hasSearchRequest: Boolean(searchRequest),
    refetch: query.refetch,
  };
};