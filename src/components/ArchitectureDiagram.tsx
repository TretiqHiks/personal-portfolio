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
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Arrow = () => (
  <div className="flex flex-col items-center my-0.5">
    <div className="w-px h-5 bg-border/50" />
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-border/50">
      <path d="M0 0L5 6L10 0" fill="currentColor" />
    </svg>
  </div>
);

const moduleStyles: Record<string, string> = {
  module: "border border-border/40 bg-muted/10",
  storage: "border border-dashed border-muted-foreground/30 bg-transparent",
  highlight: "border border-primary/50 bg-primary/10 shadow-sm shadow-primary/10",
};

const moduleNameStyles: Record<string, string> = {
  module: "text-foreground",
  storage: "text-muted-foreground",
  highlight: "text-primary",
};

export const ArchitectureDiagram = ({ modules, internalSteps }: ArchitectureDiagramProps) => {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="glass rounded-2xl p-6 mb-10"
    >
      <h2 className="text-lg font-semibold text-foreground mb-2">System Architecture</h2>
      <p className="text-xs text-muted-foreground mb-6">
        The clipper module sits in the middle of a three-part system connected through Google Drive.
      </p>

      <div className="flex gap-8">
        {/* ── Left column: vertical module pipeline ── */}
        <div className="flex flex-col items-center min-w-[180px]">
          {modules.map((mod, i) => (
            <div key={i} className="flex flex-col items-center w-full">
              <div
                className={[
                  "rounded-xl px-4 py-3 w-full text-center",
                  moduleStyles[mod.type],
                ].join(" ")}
              >
                <p className={["text-xs font-semibold mb-0.5", moduleNameStyles[mod.type]].join(" ")}>
                  {mod.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">{mod.note}</p>
              </div>
              {i < modules.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        {/* ── Right column: internal pipeline steps (shown beside the highlight module) ── */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="border border-primary/20 rounded-xl bg-primary/5 px-5 py-4">
            <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest mb-4">
              Inside the Clipper Module
            </p>
            <div className="space-y-0">
              {internalSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  {/* Step number + connector line */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div className="w-5 h-5 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-primary/70">{i + 1}</span>
                    </div>
                    {i < internalSteps.length - 1 && (
                      <div className="w-px flex-1 bg-primary/15 my-1" style={{ minHeight: "20px" }} />
                    )}
                  </div>
                  {/* Step content */}
                  <div className="pb-4">
                    <p className="text-xs font-semibold text-foreground leading-snug">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchitectureDiagram;
