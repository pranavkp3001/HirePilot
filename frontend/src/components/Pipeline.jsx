import { motion } from "framer-motion";
import { FileText, BrainCircuit, BarChart3, BadgeCheck } from "lucide-react";

const modules = [
  {
    title: "Insight Engine",
    icon: FileText,
  },
  {
    title: "Interview Engine",
    icon: BrainCircuit,
  },
  {
    title: "Assessment Engine",
    icon: BarChart3,
  },
  {
    title: "Hiring Intelligence",
    icon: BadgeCheck,
  },
];

export default function Pipeline() {
  return (
    <div className="mt-24 flex flex-col items-center gap-8">
      {modules.map((module, index) => {
        const Icon = module.icon;

        return (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.25,
            }}
            className="w-80 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-4">
              <Icon className="text-violet-400" size={24} />
              <h2 className="font-semibold">{module.title}</h2>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}