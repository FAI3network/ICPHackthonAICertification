import { Metrics } from "../components/LeaderboardTable/types";

export const formatMetrics = (metrics: Metrics) => [
  metrics.statistical_parity_difference ?? 0,
  metrics.disparate_impact ?? 0,
  metrics.average_odds_difference ?? 0,
  metrics.equal_opportunity_difference ?? 0
];