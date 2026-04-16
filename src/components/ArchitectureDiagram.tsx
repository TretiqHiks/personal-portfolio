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
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{subtitle}</p>
      )}

      <div className="flex gap-8 items-start">
        {/* ── Left: vertical pipeline ── */}
        <div className="flex flex-col items-center shrink-0 w-48">
          {modules.map((mod, i) => (
            <div key={i} className="flex flex-col items-center w-full">
              {/* Node */}
              <div
                className={[
                  "w-full rounded-xl px-3 py-2.5 text-center relative",
                  mod.type === "highlight"
                    ? "border border-primary/40 bg-primary/8 glow-primary"
                    : mod.type === "storage"
                    ? "border border-dashed border-border/60 bg-muted/10"
                    : "border border-border/40 bg-muted/10",
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
                <p className="text-[9px] text-muted-foreground/55 mt-0.5 leading-snug">{mod.note}</p>
              </div>

              {/* Connector arrow down */}
              {i < modules.length - 1 && (
                <div className="flex flex-col items-center my-0.5">
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                    <line x1="6" y1="0" x2="6" y2="13" stroke="hsl(var(--border))" strokeWidth="1.5" />
                    <polyline
                      points="2,9 6,14 10,9"
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

        {/* ── Right: internal steps ── */}
        {internalSteps.length > 0 && (
          <div className="flex-1 border border-border/40 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border/30 bg-muted/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">
                {pipelineTitle ?? "Pipeline Steps"}
              </span>
            </div>
            <div className="divide-y divide-border/20">
              {internalSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-background/40">
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
      </div>
    </motion.div>
  );
};

export default ArchitectureDiagram;
