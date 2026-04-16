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
      className="mb-10 border border-border rounded-2xl p-6 bg-muted/30"
    >
      <h2 className="text-lg font-semibold text-foreground mb-1">System Architecture</h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{subtitle}</p>
      )}

      <div className="flex gap-6 items-start">
        {/* ── Left: vertical pipeline ── */}
        <div className="flex flex-col items-center shrink-0 w-44">
          {modules.map((mod, i) => (
            <div key={i} className="flex flex-col items-center w-full">
              {/* Node */}
              <div
                className={[
                  "w-full rounded-xl px-3 py-3 text-center relative",
                  mod.type === "highlight"
                    ? "border-2 border-primary bg-primary/15 shadow-sm"
                    : mod.type === "storage"
                    ? "border-2 border-dashed border-foreground/30 bg-background"
                    : "border border-foreground/20 bg-background shadow-sm",
                ].join(" ")}
              >
                {mod.type === "storage" && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded border border-foreground/15">
                    store
                  </span>
                )}
                <p
                  className={[
                    "text-xs font-bold leading-tight",
                    mod.type === "highlight" ? "text-primary" : "text-foreground",
                  ].join(" ")}
                >
                  {mod.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{mod.note}</p>
              </div>

              {/* Connector arrow down */}
              {i < modules.length - 1 && (
                <div className="flex flex-col items-center my-0.5">
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                    <line x1="6" y1="0" x2="6" y2="13" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
                    <polyline
                      points="2,9 6,14 10,9"
                      fill="none"
                      stroke="hsl(var(--foreground) / 0.3)"
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
          <div className="flex-1 border border-border rounded-xl overflow-hidden bg-background shadow-sm">
            <div className="px-4 py-2.5 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {pipelineTitle ?? "Pipeline Steps"}
              </span>
            </div>
            <div className="divide-y divide-border">
              {internalSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-snug">{step.label}</p>
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
