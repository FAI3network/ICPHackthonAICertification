export interface Model {
  verifier: string;
  data: { name: string };
  metrics: number[];
}

export interface LeaderboardTableProps {
  models: Model[];
}
