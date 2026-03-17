import { motion } from "framer-motion";
import content from "@/data/content.json";

const StatusBubble = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex justify-center pt-4 pb-2"
    >
      <div className="glass rounded-full px-4 py-1.5 flex items-center gap-2 glow-green">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-emerald-600">
          {content.statusBubble.text}
        </span>
      </div>
    </motion.div>
  );
};

export default StatusBubble;
