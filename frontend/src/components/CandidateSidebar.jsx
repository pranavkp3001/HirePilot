export default function CandidateSidebar({
  candidates,
  selectedCandidate,
  onSelect,
}) {
  return (
    <div className="bg-zinc-900 border-r border-zinc-800 h-screen overflow-y-auto">

      <div className="p-6 border-b border-zinc-800">

        <h2 className="text-2xl font-bold text-white">
          Candidates
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          {candidates.length} Uploaded
        </p>

      </div>

      <div className="p-4 space-y-3">

        {candidates.map((candidate, index) => (

          <button
            key={candidate.email || index}
            onClick={() => onSelect(candidate)}
            className={`w-full rounded-xl p-4 text-left transition

            ${
              selectedCandidate?.email === candidate.email
                ? "bg-violet-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >

            <h3 className="font-semibold">
              {candidate.name}
            </h3>

            <p className="text-sm opacity-80">
              {candidate.recommended_role}
            </p>

          </button>

        ))}

      </div>

    </div>
  );
}