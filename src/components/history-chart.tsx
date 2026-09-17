"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function HistoryChart({
  data,
  lines,
  height = 220,
}: {
  data: Array<Record<string, string | number>>;
  lines: Array<{ key: string; color: string; label: string }>;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "var(--foreground-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--background-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
