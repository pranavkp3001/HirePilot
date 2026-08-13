import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import Pipeline from "./Pipeline";
import UploadCard from "./UploadCard";

export default function Hero({ onUpload }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">

      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl text-center">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm text-violet-300 backdrop-blur-xl"
        >
          🚀 NEW
          <span className="text-zinc-300">
            AI Recruitment Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-7xl md:text-8xl font-black"
        >
          Hire<span className="text-violet-500">Pilot</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .2 }}
          className="mt-6 text-3xl text-violet-300 font-semibold"
        >
          AI Recruitment Co-Pilot
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .4 }}
          className="mt-8 max-w-3xl mx-auto text-zinc-400 text-lg leading-8"
        >
          Upload resumes, analyze candidates using AI, generate adaptive
          technical interviews and recruiter-ready hiring reports.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .6 }}
          className="mt-12 flex justify-center gap-5"
        >
          <button
            onClick={() => setShowUpload(true)}
            className="rounded-xl bg-violet-600 px-8 py-4 font-semibold hover:bg-violet-500 transition"
          >
            Start Screening →
          </button>

          <button
            className="rounded-xl border border-zinc-700 px-8 py-4"
          >
            See Workflow
          </button>
        </motion.div>

        <Pipeline />

        <AnimatePresence>
          {showUpload && (
            <UploadCard
              onUpload={onUpload}
              onClose={() => setShowUpload(false)}
            />
          )}
        </AnimatePresence>

      </div>

    </section>
  );
}