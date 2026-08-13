import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">

      {/* Grid */}

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* Aurora */}

      <motion.div
        animate={{
          x: [0, 150, -100, 0],
          y: [0, -80, 80, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[900px] w-[900px]
        -translate-x-1/2 -translate-y-1/2 rounded-full
        bg-violet-600 blur-[220px] opacity-20"
      />

      <motion.div
        animate={{
          x: [0, -120, 100, 0],
          y: [0, 100, -50, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: "easeInOut",
        }}
        className="absolute left-[30%] top-[35%]
        h-[600px] w-[600px]
        rounded-full bg-blue-500 blur-[180px] opacity-20"
      />

      <motion.div
        animate={{
          x: [0, 120, -100, 0],
          y: [0, 60, -120, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 26,
          ease: "easeInOut",
        }}
        className="absolute right-[20%] bottom-[10%]
        h-[500px] w-[500px]
        rounded-full bg-fuchsia-500 blur-[180px] opacity-20"
      />

    </div>
  );
}