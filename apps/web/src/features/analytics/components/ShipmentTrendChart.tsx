// 出荷推移チャートコンポーネント

"use client";

import type { TimeSeriesData } from "@/types/analytics";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ShipmentTrendChartProps {
  data: TimeSeriesData[];
  title?: string;
}

export default function ShipmentTrendChart({ data, title = "出荷推移" }: ShipmentTrendChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">データがありません</div>;
  }

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "revenue") return [`¥${Number(value).toLocaleString()}`, "売上"];
              if (name === "averagePrice") return [`¥${Number(value).toLocaleString()}`, "平均価格"];
              return [value, name === "shipments" ? "出荷数" : name];
            }}
            labelFormatter={(label) => `期間: ${label}`}
          />
          <Legend />
          <Line type="monotone" dataKey="shipments" stroke="#8884d8" strokeWidth={2} name="出荷数" dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} name="売上" dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="averagePrice" stroke="#ffc658" strokeWidth={2} name="平均価格" dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
