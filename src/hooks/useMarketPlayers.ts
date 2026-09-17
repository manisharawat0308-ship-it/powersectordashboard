import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface MarketPlayer {
  rank: number;
  name: string;
  totalRECapacityMW: number;
  solarMW: number;
  windMW: number;
  hydroMW: number;
  otherMW: number;
  ownership: string;
  listed: string;
  source: string;
  notes: string;
}

export interface MarketPlayersData {
  lastUpdated: string;
  dataSources: string[];
  nationalRESummary: {
    totalRECapacityMW: number;
    solarMW: number;
    windMW: number;
    smallHydroMW: number;
    biomassMW: number;
    largeHydroMW: number;
    nuclearMW: number;
    totalNonFossilMW: number;
    note: string;
  };
  companies: MarketPlayer[];
}

export function useMarketPlayers() {
  return useQuery({
    queryKey: ['capacity', 'market-players'],
    queryFn: () => fetchJson<MarketPlayersData>('/data/capacity/market-players.json'),
  });
}
