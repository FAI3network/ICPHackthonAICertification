import { LeaderboardTable } from "../components";
import "./Leaderboard.css";
import { ICPHackthonAICertification_backend } from "../../../declarations/ICPHackthonAICertification_backend";
import React, { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { Model, LeaderboardTableProps } from "../../../ICPHackthonAICertification_frontend/src/components/LeaderboardTable/types";

interface DataPoint {
  data_point_id: bigint;  
  target: boolean;
  privileged: boolean;
  predicted: boolean;
  timestamp: bigint;     
}

interface Metrics {
  statistical_parity_difference?: number | null;
  disparate_impact?: number | null;
  average_odds_difference?: number | null;
  equal_opportunity_difference?: number | null;
}

interface ModelBE {
  model_id: bigint;        
  model_name: string;      
  user_id: string;         
  data_points: DataPoint[]; 
  metrics: Metrics;
}

interface User {
  user_id: string;       
  models: Array<[bigint, Model]>;
}

function Leaderboard() {

    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const convertPrincipalToString = (principal: Principal): string => {
      return principal.toText();
    };

    const formatMetrics = (metrics: Metrics) => [
      metrics.statistical_parity_difference ?? 0,
      metrics.disparate_impact ?? 0,
      metrics.average_odds_difference ?? 0,
      metrics.equal_opportunity_difference ?? 0
    ];

    // Fetch models on component mount
    useEffect(() => {
      const fetchModels = async () => {
        try {
          const result = await ICPHackthonAICertification_backend.get_all_models();

          const formattedModels = result.map((model: any) => ({
            metrics: formatMetrics(model.metrics), 
            verifier: "0xbcc74b3cb8f05f3c58f1efa884151822ec4beb4a",
            data: {
              name: model.model_name,
            }
          }));

          setModels(formattedModels);

        } catch (error) {
          console.error("Error fetching models:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchModels();
    }, []);

    if (loading) {
      return <div>Loading models...</div>;
    }

  return (

    <div className="leaderboard-wrapper">
      <main className="leaderboard">
        <h2>Machine Learning Model Leaderboard</h2>
        <p>
          Compare the performance of different machine learning models.
        </p>
        <LeaderboardTable models={models}/>
      </main>
    </div>
  )
}

export default Leaderboard;