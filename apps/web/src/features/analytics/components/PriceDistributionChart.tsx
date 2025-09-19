// 価格分布チャートコンポーネント

"use client";

import type { PriceDistribution } from "@/types/analytics";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PriceDistributionChartProps {
  data: PriceDistribution[];
  title?: string;
}

export default function PriceDistributionChart({ data, title = "価格分布" }: PriceDistributionChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">データがありません</div>;
  }

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="priceRange" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "count") return [value, "出荷数"];
              if (name === "percentage") return [`${Number(value).toFixed(1)}%`, "割合"];
              return [value, name];
            }}
            labelFormatter={(label) => `価格帯: ${label}`}
          />
          <Bar dataKey="count" fill="#8884d8" name="出荷数" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
