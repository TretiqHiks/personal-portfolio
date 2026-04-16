import { motion } from "framer-motion";

interface DiagramModule {
  name: string;
  note: string;
  type: "module" | "storage" | "highlight";
}

interface InternalStep {
  label: string;
  note: string;
}

interface ArchitectureDiagramProps {
  modules: DiagramModule[];
  internalSteps: InternalStep[];
  subtitle?: string;
  pipelineTitle?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const ArchitectureDiagram = ({
  modules,
  internalSteps,
  subtitle,
  pipelineTitle,
}: ArchitectureDiagramProps) => {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="mb-10"
    >
      <h2 className="text-lg font-semibold text-foreground mb-1">System Architecture</h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{subtitle}</p>
      )}

      {/* ── Pipeline flow ── */}
      <div className="relative overflow-x-auto pb-1">
        <div className="flex items-stretch gap-0 min-w-max">
          {modules.map((mod, i) => (
            <div key={i} className="flex items-center">
              {/* Module card */}
              <div
                className={[
                  "relative flex flex-col justify-center px-4 py-3 rounded-xl min-w-[110px] transition-all",
                  mod.type === "highlight"
                    ? "border border-primary/40 bg-primary/8 glow-primary"
                    : mod.type === "storage"
                    ? "border border-dashed border-border bg-muted/20"
                    : "border border-border/50 bg-muted/10",
                ].join(" ")}
              >
                {mod.type === "storage" && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-muted-foreground/50 bg-background px-1">
                    store
                  </span>
                )}
                <p
                  className={[
                    "text-[11px] font-semibold leading-tight",
                    mod.type === "highlight" ? "text-primary" : "text-foreground/80",
                  ].join(" ")}
                >
                  {mod.name}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1 leading-snug">{mod.note}</p>
              </div>

              {/* Arrow connector */}
              {i < modules.length - 1 && (
                <div className="flex items-center shrink-0 mx-1">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                    <line x1="0" y1="6" x2="16" y2="6" stroke="hsl(var(--border))" strokeWidth="1.5" />
                    <polyline
                      points="11,2 16,6 11,10"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Internal steps ── */}
      {internalSteps.length > 0 && (
        <div className="mt-5 border border-border/40 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-border/30 bg-muted/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">
              {pipelineTitle ?? "Pipeline Steps"}
            </span>
          </div>

          {/* Steps */}
          <div className="divide-y divide-border/20">
            {internalSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-3 bg-background/40">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary/70">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground/85 leading-snug">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ArchitectureDiagram;
