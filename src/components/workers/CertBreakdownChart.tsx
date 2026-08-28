import type { CertTypeBreakdown } from "@/lib/stats";

const SEGMENT_STYLE = {
  valid: { color: "var(--status-good-text)", label: "Valid" },
  expiringSoon: { color: "var(--status-warning-text)", label: "Expiring Soon" },
  critical: { color: "var(--status-critical-text)", label: "Expired / Red-Flagged" },
} as const;

function Segment({ widthPct, color, first, last }: { widthPct: number; color: string; first: boolean; last: boolean }) {
  if (widthPct <= 0) return null;
  return (
    <div
      className={`h-full ${first ? "rounded-l-full" : ""} ${last ? "rounded-r-full" : ""}`}
      style={{ width: `${widthPct}%`, background: color }}
    />
  );
}

export default function CertBreakdownChart({ data }: { data: CertTypeBreakdown[] }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Certifications by type</h2>
        <ul className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-muted)]">
          {Object.values(SEGMENT_STYLE).map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {data.map((row) => {
          const validPct = row.total ? (row.valid / row.total) * 100 : 0;
          const expiringPct = row.total ? (row.expiringSoon / row.total) * 100 : 0;
          const criticalPct = row.total ? (row.critical / row.total) * 100 : 0;
          const segments = (
            [
              { key: "valid", pct: validPct },
              { key: "expiringSoon", pct: expiringPct },
              { key: "critical", pct: criticalPct },
            ] as { key: keyof typeof SEGMENT_STYLE; pct: number }[]
          ).filter((s) => s.pct > 0);

          return (
            <div key={row.type} className="grid grid-cols-1 gap-1.5 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4">
              <p className="text-sm font-medium text-[var(--foreground)]">{row.type}</p>
              <div
                className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]"
                role="img"
                aria-label={`${row.type}: ${row.valid} valid, ${row.expiringSoon} expiring soon, ${row.critical} expired or red-flagged`}
              >
                <div className="flex h-full w-full gap-[2px]">
                  {segments.map((s, i) => (
                    <Segment
                      key={s.key}
                      widthPct={s.pct}
                      color={SEGMENT_STYLE[s.key].color}
                      first={i === 0}
                      last={i === segments.length - 1}
                    />
                  ))}
                </div>
              </div>
              <p className="tabular-nums text-xs text-[var(--foreground-muted)] sm:text-right">
                <span className="font-semibold text-[var(--foreground)]">{row.total}</span> workers &middot;{" "}
                {row.critical > 0 && (
                  <span className="font-medium" style={{ color: "var(--status-critical-text)" }}>
                    {row.critical} urgent
                  </span>
                )}
                {row.critical === 0 && row.expiringSoon > 0 && (
                  <span className="font-medium" style={{ color: "var(--status-warning-text)" }}>
                    {row.expiringSoon} expiring
                  </span>
                )}
                {row.critical === 0 && row.expiringSoon === 0 && (
                  <span className="font-medium" style={{ color: "var(--status-good-text)" }}>
                    all valid
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
