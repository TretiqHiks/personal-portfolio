import { motion } from "framer-motion";

interface DiagramModule {
  name: string;
  note: string;
  highlight?: boolean;
  storage?: boolean;
}

interface ArchitectureDiagramProps {
  modules: DiagramModule[];
  internalSteps: string[];
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const ArchitectureDiagram = ({ modules, internalSteps }: ArchitectureDiagramProps) => {
  const highlightIndex = modules.findIndex((m) => m.highlight);

  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="glass rounded-2xl p-6 mb-10"
    >
      <h2 className="text-lg font-semibold text-foreground mb-6">Architecture Overview</h2>

      {/* Top row: module pipeline */}
      <div className="flex flex-wrap items-center gap-0 mb-8 overflow-x-auto pb-2">
        {modules.map((mod, i) => (
          <div key={i} className="flex items-center">
            {/* Module box */}
            <div
              className={[
                "rounded-xl px-4 py-3 min-w-[120px] max-w-[160px] text-center transition-all",
                mod.highlight
                  ? "border border-primary/60 bg-primary/10 shadow-sm shadow-primary/20"
                  : mod.storage
                  ? "border border-dashed border-muted-foreground/30 bg-muted/20"
                  : "border border-border/40 bg-muted/10",
              ].join(" ")}
            >
              <p
                className={[
                  "text-xs font-semibold leading-snug mb-1",
                  mod.highlight ? "text-primary" : "text-foreground",
                ].join(" ")}
              >
                {mod.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{mod.note}</p>
            </div>

            {/* Arrow between modules */}
            {i < modules.length - 1 && (
              <div className="flex items-center mx-1 shrink-0">
                <svg
                  width="28"
                  height="16"
                  viewBox="0 0 28 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-muted-foreground/40"
                >
                  <line x1="0" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.5" />
                  <polyline
                    points="14,3 20,8 14,13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vertical connector from highlighted module down to internal steps */}
      {highlightIndex >= 0 && (
        <div className="flex">
          {/* Spacer to align with the highlighted module */}
          <div
            className="shrink-0"
            style={{
              width: `${highlightIndex * (160 + 36)}px`,
            }}
          />

          <div className="flex flex-col items-center">
            {/* Connector line going down */}
            <div className="w-px h-5 bg-primary/30" />

            {/* Internal steps container */}
            <div className="border border-primary/20 rounded-xl bg-primary/5 px-4 py-3 w-[160px]">
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide mb-3">
                Pipeline Steps
              </p>
              <div className="space-y-0">
                {internalSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {/* Dot + vertical line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary/60 mt-1 shrink-0" />
                      {i < internalSteps.length - 1 && (
                        <div className="w-px flex-1 bg-primary/20 my-0.5" style={{ minHeight: "16px" }} />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug pb-3">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ArchitectureDiagram;
