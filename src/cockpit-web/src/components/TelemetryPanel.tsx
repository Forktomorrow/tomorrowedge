import { useState } from "react";
import type { CockpitTelemetry } from "../../../cockpit/contracts.js";
import type { Translator } from "../i18n.js";

export function TelemetryPanel({ telemetry, t, onOpenDetails }: { telemetry: CockpitTelemetry; t: Translator; onOpenDetails?: () => void }) {
  const [showWhatIf, setShowWhatIf] = useState(false);
  const routes = [
    telemetry.coderModel && `coder: ${telemetry.coderModel}`,
    telemetry.reviewerModel && `reviewer: ${telemetry.reviewerModel}`,
    telemetry.judgeModel && `judge: ${telemetry.judgeModel}`,
  ].filter(Boolean) as string[];

  return (
    <aside className="te-panel te-telemetry" data-testid="telemetry-panel">
      <header><h2>{t("telemetry.title")}</h2><span className="te-chip">{t("telemetry.fallback", { count: telemetry.fallbackCount })}</span></header>
      {routes.length > 0 && (
        <div data-testid="telemetry-routing">
          {routes.map((route) => (
            <div key={route} className="te-metric">
              <span>{route.split(": ")[0]}</span>
              <strong>{route.split(": ")[1]}</strong>
            </div>
          ))}
        </div>
      )}
      <Metric label={t("telemetry.cost")} value={`${money(telemetry.currentCostUsd)} / ${money(telemetry.budgetUsd)}`} />
      <Metric label={t("telemetry.tokens")} value={compact(telemetry.totalTokens)} />
      <Metric label={t("telemetry.cache")} value={typeof telemetry.cacheHitPercent === "number" ? `${telemetry.cacheHitPercent}%` : "-"} />
      <Metric label={t("telemetry.agents")} value={t("telemetry.agentsValue", { done: telemetry.completed, waiting: telemetry.waiting })} />
      <Metric label={t("telemetry.latency")} value={telemetry.latencyMs ? `${Math.round(telemetry.latencyMs / 1000)}s` : "-"} />
      <Metric label={t("telemetry.risk")} value={telemetry.latestRiskLevel ?? "-"} />
      {/* What-If Explorer */}
      {routes.length > 0 && (
        <>
          <button
            type="button"
            className="te-link-button"
            onClick={() => setShowWhatIf(!showWhatIf)}
            style={{ marginTop: 4, fontSize: 10 }}
          >
            {showWhatIf ? "▾" : "▸"} 路由明细
          </button>
          {showWhatIf && (
            <div style={{ margin: "0 12px 8px", padding: "6px 8px", border: "1px solid var(--te-border)", borderRadius: 5, background: "var(--te-alt)", fontSize: 11 }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--te-deep-blue)" }}>当前路由 (实际费用)</div>
              {(telemetry.roleCosts ?? []).length > 0 ? telemetry.roleCosts!.map((r) => (
                <div key={r.role} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid rgba(215,228,234,0.3)" }}>
                  <span style={{ fontWeight: 500 }}>{r.role}</span>
                  <span style={{ font: "11px var(--te-mono)", color: "var(--te-muted)" }}>{r.model}</span>
                  <span style={{ font: "11px var(--te-mono)" }}>${r.costUsd.toFixed(4)}</span>
                </div>
              )) : routes.map((route) => {
                const [role, model] = route.split(": ") as [string, string];
                return (
                  <div key={role} style={{ padding: "3px 0", borderBottom: "1px solid rgba(215,228,234,0.3)" }}>
                    <span style={{ fontWeight: 500 }}>{role}: </span>
                    <span style={{ font: "11px var(--te-mono)", color: "var(--te-muted)" }}>{model}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 6, color: "var(--te-muted)", font: "10px var(--te-mono)", textAlign: "center" }}>
                模型对比需要真实的 provider 价格 baseline
              </div>
            </div>
          )}
        </>
      )}

      <button type="button" className="te-link-button" onClick={onOpenDetails} aria-label={t("telemetry.details")} data-testid="telemetry-details">
        {t("telemetry.details")}
      </button>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="te-metric"><span>{label}</span><strong>{value}</strong></div>;
}

function money(value?: number) {
  return typeof value === "number" ? `$${value.toFixed(4)}` : "-";
}

function compact(value: number) {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}
