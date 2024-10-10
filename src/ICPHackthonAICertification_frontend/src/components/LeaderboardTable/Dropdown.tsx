import { Table } from "@tanstack/react-table";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Model } from "./types";
import "./leaderboardTable.css";

export default function Dropdown({ table }: { table: Table<Model> }) {
  const [isOpen, setIsOpen] = useState(false);
  const categories = ["Xgboost Credit Classifier", "Neuro Imaging Classifier"];
  const [currentCategory, setCurrentCategory] = useState(categories[0]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button className="columns-button" onClick={() => setIsOpen(!isOpen)}>
        Categories
        <ChevronDown size={16} />
      </button>
      {
        isOpen && (
          <div className="columns-dropdown">
            <div>
              {categories.map((category) => (
                <div key={category} className="dropdown-option" onClick={() => setCurrentCategory(category)} style={{ cursor: "pointer" }}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px" }}>
                      {category === currentCategory ? <Check size={16} /> : ""}
                    </span>
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )
      }
    </div>
  );
}