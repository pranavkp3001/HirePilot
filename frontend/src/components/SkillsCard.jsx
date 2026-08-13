export default function SkillsCard({ candidate }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

      <h2 className="text-xl font-bold mb-5">
        Skills
      </h2>

      <div className="flex flex-wrap gap-3">

        {candidate.skills?.map((skill, index) => (

          <span
            key={index}
            className="bg-violet-600/20 border border-violet-500/30 rounded-full px-4 py-2 text-sm"
          >
            {skill}
          </span>

        ))}

      </div>

    </div>
  );
}