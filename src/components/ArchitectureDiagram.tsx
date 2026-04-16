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
      className="glass rounded-2xl p-6 mb-10"
    >
      <h2 className="text-lg font-semibold text-foreground mb-1">System Architecture</h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-6">{subtitle}</p>
      )}

      {/* ── Section 1: Module flow ── */}
      <div className="flex flex-wrap items-start gap-y-3 mb-6">
        {modules.map((mod, i) => (
          <div key={i} className="flex items-center">
            <div
              className={[
                "rounded-lg px-3 py-2 text-center",
                mod.type === "highlight"
                  ? "border border-primary/50 bg-primary/10"
                  : mod.type === "storage"
                  ? "border border-dashed border-muted-foreground/25 bg-transparent"
                  : "border border-border/35 bg-muted/10",
              ].join(" ")}
            >
              <p
                className={[
                  "text-[11px] font-semibold whitespace-nowrap",
                  mod.type === "highlight"
                    ? "text-primary"
                    : mod.type === "storage"
                    ? "text-muted-foreground/60"
                    : "text-foreground",
                ].join(" ")}
              >
                {mod.name}
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5 whitespace-nowrap">{mod.note}</p>
            </div>

            {i < modules.length - 1 && (
              <span className="mx-2 text-muted-foreground/30 text-sm select-none">→</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-border/20 mb-5" />

      {/* ── Section 2: Internal pipeline steps ── */}
      {pipelineTitle && (
        <p className="text-[10px] font-semibold text-primary/50 uppercase tracking-widest mb-4">
          {pipelineTitle}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
        {internalSteps.map((step, i) => (
          <div key={i} className="flex gap-3 pb-4">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div className="w-5 h-5 rounded-full border border-primary/30 bg-primary/8 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-primary/60">{i + 1}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground/80 leading-snug">{step.label}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{step.note}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ArchitectureDiagram;
