export default function ContentDashboardLoading() {
  const sk = (w: number | string, h: number) => ({
    height: h, width: w, background: "var(--border-subtle)", borderRadius: 4, display: "block" as const
  })
  return (
    <div className="vac-admin-dashboard-new">
      <div className="admin-page-header">
        <div style={sk(200, 28)} />
        <div style={sk(120, 14)} />
      </div>
      <div className="vac-dashboard-kpi-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="vac-dashboard-kpi-card" style={{ opacity: 0.5, pointerEvents: "none" }}>
            <div style={{ width: 40, height: 40, background: "var(--border-subtle)", borderRadius: 8 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={sk(80, 12)} />
              <div style={sk(50, 22)} />
            </div>
          </div>
        ))}
      </div>
      <div className="vac-dashboard-panels-grid">
        <div className="vac-panels-col">
          <div className="admin-card skeleton" style={{ minHeight: 300 }} />
          <div className="admin-card skeleton" style={{ minHeight: 280 }} />
        </div>
        <div className="vac-panels-col">
          <div className="admin-card skeleton" style={{ minHeight: 220 }} />
          <div className="admin-card skeleton" style={{ minHeight: 200 }} />
        </div>
      </div>
    </div>
  )
}
