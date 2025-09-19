// 性別分析チャートコンポーネント

"use client";

import type { GenderAnalysis } from "@/types/analytics";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface GenderAnalysisChartProps {
  data: GenderAnalysis[];
  title?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const getGenderLabel = (gender: string) => {
  switch (gender) {
    case "MALE":
      return "オス";
    case "FEMALE":
      return "メス";
    case "CASTRATED":
      return "去勢";
    default:
      return gender;
  }
};

export default function GenderAnalysisChart({ data, title = "性別分析" }: GenderAnalysisChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">データがありません</div>;
  }

  // Recharts用にデータを変換
  const chartData = data.map((item) => ({
    ...item,
    name: getGenderLabel(item.gender),
  }));

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count">
            {chartData.map((entry, index: number) => (
              <Cell key={`cell-${entry.gender}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              if (name === "count") return [value, "出荷数"];
              if (name === "averagePrice") return [`¥${Number(value).toLocaleString()}`, "平均価格"];
              if (name === "percentage") return [`${Number(value).toFixed(1)}%`, "割合"];
              return [value, name];
            }}
            labelFormatter={(label) => `性別: ${getGenderLabel(label)}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
