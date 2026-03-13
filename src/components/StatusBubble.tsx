import { motion } from "framer-motion";

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
          <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="text-xs font-medium text-accent">
          Open to opportunities
        </span>
      </div>
    </motion.div>
  );
};

export default StatusBubble;
