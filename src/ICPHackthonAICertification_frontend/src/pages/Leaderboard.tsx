import { LeaderboardTable } from "../components";
import "./Leaderboard.css";
import { ICPHackthonAICertification_backend } from "../../../declarations/ICPHackthonAICertification_backend";
import React, { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { Model, LeaderboardTableProps, Metrics, DataPoint } from "../../../ICPHackthonAICertification_frontend/src/components/LeaderboardTable/types";
import { format } from "../utils";

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

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const result = await ICPHackthonAICertification_backend.get_all_models();

        console.log("Models:", result);

        const formattedModels = result.map((model: any) => ({
          id: Number(model.model_id),
          metrics: format.formatMetrics(model.metrics),
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
        <LeaderboardTable models={models} />
      </main>
    </div>
  )
}

export default Leaderboard;