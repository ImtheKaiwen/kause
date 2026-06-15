import { motion } from 'framer-motion';

export default function Splash() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
    >
      <h1 className="text-pure-white text-[28px] font-semibold tracking-tighter" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        kause.
      </h1>
    </motion.div>
  );
}
