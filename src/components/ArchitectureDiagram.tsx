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

const DownArrow = () => (
  <div className="flex flex-col items-center py-1 shrink-0">
    <div className="w-px h-4 bg-border/40" />
    <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className="text-border/40">
      <path d="M0 0L4 5L8 0Z" />
    </svg>
  </div>
);

export const ArchitectureDiagram = ({ modules, internalSteps }: ArchitectureDiagramProps) => {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="glass rounded-2xl p-6 mb-10"
    >
      <h2 className="text-lg font-semibold text-foreground mb-1">System Architecture</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Three decoupled modules connected through Google Drive as the storage backbone.
      </p>

      <div className="flex flex-col items-center">
        {modules.map((mod, i) => {
          const isHighlight = mod.type === "highlight";
          const isStorage = mod.type === "storage";

          return (
            <div key={i} className="flex flex-col items-center w-full max-w-sm">
              {/* Module node */}
              <div
                className={[
                  "w-full rounded-xl px-5 py-3 text-center",
                  isHighlight
                    ? "border border-primary/50 bg-primary/10 shadow-sm shadow-primary/10"
                    : isStorage
                    ? "border border-dashed border-muted-foreground/30 bg-transparent"
                    : "border border-border/40 bg-muted/10",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-semibold mb-0.5",
                    isHighlight ? "text-primary" : isStorage ? "text-muted-foreground/70" : "text-foreground",
                  ].join(" ")}
                >
                  {mod.name}
                  {isHighlight && (
                    <span className="ml-2 text-[9px] font-normal tracking-wider text-primary/50 uppercase">
                      this project
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">{mod.note}</p>
              </div>

              {/* Internal steps — shown inside the highlighted module */}
              {isHighlight && internalSteps.length > 0 && (
                <div className="w-full mt-2 mb-0 border-x border-primary/20 px-4">
                  <div className="border border-primary/15 rounded-xl bg-primary/5 px-4 py-3 w-full">
                    <p className="text-[9px] font-semibold text-primary/50 uppercase tracking-widest mb-3">
                      Internal pipeline
                    </p>
                    {internalSteps.map((step, si) => (
                      <div key={si} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                          <div className="w-4 h-4 rounded-full border border-primary/35 bg-primary/10 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-primary/60">{si + 1}</span>
                          </div>
                          {si < internalSteps.length - 1 && (
                            <div className="w-px flex-1 bg-primary/10 my-0.5" style={{ minHeight: "14px" }} />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-[11px] font-semibold text-foreground/80 leading-snug">
                            {step.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                            {step.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {i < modules.length - 1 && <DownArrow />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ArchitectureDiagram;
