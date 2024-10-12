import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { ICPHackthonAICertification_backend } from "../../../declarations/ICPHackthonAICertification_backend";
import { Model as ModelType, Metrics, DataPoint } from "../components/LeaderboardTable/types";
import "./Model.css"
import { format } from "../utils";

export default function Model() {
  const { modelId } = useParams<{ modelId: string }>();
  const [model, setModel] = useState<ModelType>();
  const [datapoints, setDatapoints] = useState<DataPoint[]>([]);

  useEffect(() => {
    console.log(`Model ID: ${modelId}`);

    const fetchModel = async () => {
      try {
        const result = await ICPHackthonAICertification_backend.get_model(BigInt(modelId!));

        console.log("Model:", result);

        setModel({
          id: Number(result.model_id),
          metrics: format.formatMetrics(result.metrics as unknown as Metrics),
          verifier: "0xbcc74b3cb8f05f3c58f1efa884151822ec4beb4a",
          data: {
            name: result.model_name,
          }
        })

        setDatapoints(result.data_points);
      } catch (err) {
        console.error(err);
      }
    }

    fetchModel();
  }, []);

  return (
    <div className="model-wrapper">
      <main className="model">
        <h2>Model {modelId}</h2>
        <p>
          View the details of a machine learning model.
        </p>

        <table className="model-table">
          <tr className="model-row">
            <th className="model-tab">
              <h3>Model Details</h3>

              <p>
                <strong>Name:</strong> {model?.data.name}
              </p>
              <p style={{ textAlign: "left", lineHeight: 2 }}>
                An Xgboost-based machine learning model for credit scoring applications.
                <br />
                Framework: Xgboost
                <br />
                Version: 1.0
                <br />
                Size:
                <br />
                Accuracy:
                <br />
                Objective: binary:logistic
              </p>
            </th>

            <th className="model-tab">
              <h3>Model Metrics</h3>
              <p>
                Visualize the performance of your AI model over time.
              </p>
              <img src="Model Metrics.png" alt="Model Metrics" />
            </th>
          </tr>

          <tr className="model-row">
            <th colSpan={2} className="model-tab">
              <h3 style={{}}>Model Performance Summary</h3>
              <p>Key metrics for the latest model run.</p>
              <div className="summary-data">
                <p>
                  <strong>0.92</strong>
                  <br />
                  Accuracy
                </p>
                <p>
                  <strong>0.88</strong>
                  <br />
                  Precision
                </p>
                <p>
                  <strong>0.94</strong>
                  <br />
                  Recall
                </p>
              </div>
            </th>
          </tr>

          <tr className="model-row">
            <th className="model-tab">
              <h3>Statistical Parity Difference</h3>
              <p>The statistical parity difference measures the difference in the positive outcome rates between the unprivileged group and the privileged group.</p>
              <img src="SPD.png" alt="Statistical Parity Difference" />
              <p style={{ textAlign: "center", width: "100%" }}>
                Unfair outcome: SPD significantly different from 0 (e.g., -0.4 or 0.4)
                <br />
                Fair outcome: SPD significantly different from 0 (e.g., -0.4 or 0.4)
              </p>
            </th>

            <th className="model-tab">
              <h3>Disparate Impact</h3>
              <p>Disparate impact compares the ratio of the positive outcome rates between the unprivileged group and the privileged group.</p>
              <img src="DI.png" alt="Disparate Impact" />
              <p style={{ textAlign: "center", width: "100%" }}>
                Unfair outcome: DI significantly different from 1 (e.g., less than 0.8 or greater than 1.25)
                <br />
                Fair outcome: DI significantly different from 1 (e.g., less than 0.8 or greater than 1.25)
              </p>
            </th>
          </tr>

          <tr className="model-row">
            <th className="model-tab">
              <h3>Average Odds Difference</h3>
              <p>
                The average odds difference measures the difference in false positive rates and true positive rates between the unprivileged group and the privileged group.
              </p>
              <img src="AOD.png" alt="Average Odds Difference" />
              <p style={{ textAlign: "center", width: "100%" }}>
                Unfair outcome: AOD significantly different from 0 (e.g., -0.2 or 0.2)
                <br />
                Fair outcome: AOD significantly different from 0 (e.g., -0.2 or 0.2)
              </p>
            </th>

            <th className="model-tab">
              <h3>Equal Opportunity Difference</h3>
              <p>
                The equal opportunity difference measures the difference in true positive rates between the unprivileged group and the privileged group.
              </p>
              <img src="EOD.png" alt="Equal Opportunity Difference" />
              <p style={{ textAlign: "center", width: "100%" }}>
                Unfair outcome: EOD significantly different from 0 (e.g., -0.2 or 0.2)
                <br />
                Fair outcome: EOD significantly different from 0 (e.g., -0.2 or 0.2)
              </p>
            </th>
          </tr>
        </table>

      </main>
    </div>
  )
}