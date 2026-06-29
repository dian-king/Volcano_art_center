"use client"

import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts"

interface ContentChartsProps {
  productsByStatus: { name: string; value: number }[]
  blogByCategory: { category: string; count: number }[]
  recentPublished: { date: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "#00A651",
  DRAFT: "#9A9A94",
  ARCHIVED: "#C2621A",
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

export function ContentCharts({ productsByStatus, blogByCategory, recentPublished }: ContentChartsProps) {
  return (
    <div className="content-charts-grid">
      {/* Donut: Products by status */}
      <div style={CARD}>
        <p style={LABEL}>Products by Status</p>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={productsByStatus}
              cx="50%" cy="50%"
              innerRadius={42} outerRadius={65}
              dataKey="value"
              paddingAngle={2}
            >
              {productsByStatus.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#9A9A94"} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [v, String(n)]} />
          </PieChart>
        </ResponsiveContainer>
        {/* Custom legend — no overlap */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "var(--space-2)" }}>
          {productsByStatus.map(e => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[e.name] ?? "#9A9A94", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>{e.name}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{e.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar: Blog by category */}
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

      {/* Area: Published over time */}
      <div style={CARD}>
        <p style={LABEL}>Published (14 days)</p>
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
