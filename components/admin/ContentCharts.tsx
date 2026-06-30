"use client"

import {
  Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts"

interface ContentChartsProps {
  blogByCategory: { category: string; count: number }[]
  recentPublished: { date: string; count: number }[]
}

const CARD: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
}

const LABEL: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontWeight: 700,
  fontSize: "var(--text-caption)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "var(--space-3)",
}

export function ContentCharts({ blogByCategory, recentPublished }: ContentChartsProps) {
  return (
    <div className="content-charts-grid">
      <div style={CARD}>
        <p style={LABEL}>Blog by Category</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={blogByCategory} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--green)" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={CARD}>
        <p style={LABEL}>Recent Blog Updates</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={recentPublished}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" fill="#00A65120" stroke="#00A651" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
