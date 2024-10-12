export interface Model {
  id: number;
  verifier?: string;
  data: { name: string };
  metrics: number[];
}

export interface LeaderboardTableProps {
  models: Model[];
}

export interface Metrics {
  statistical_parity_difference?: number | null;
  disparate_impact?: number | null;
  average_odds_difference?: number | null;
  equal_opportunity_difference?: number | null;
}


export interface DataPoint {
  data_point_id: bigint;
  target: boolean;
  privileged: boolean;
  predicted: boolean;
  timestamp: bigint;
}