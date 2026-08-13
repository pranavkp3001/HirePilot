import { useState, useEffect } from "react";

import CandidateSidebar from "../components/CandidateSidebar";
import CandidateProfile from "../components/CandidateProfile";
import SkillsCard from "../components/SkillsCard";
import ProjectsCard from "../components/ProjectsCard";

export default function Dashboard({
  candidate,
  candidates,
}) {
  const [selectedCandidate, setSelectedCandidate] =
    useState(candidate);

  useEffect(() => {
    setSelectedCandidate(candidate);
  }, [candidate]);

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white">
        No Candidate Selected
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#09090B] text-white">

      {/* Sidebar */}

      <div className="w-[320px]">

        <CandidateSidebar
          candidates={candidates}
          selectedCandidate={selectedCandidate}
          onSelect={setSelectedCandidate}
        />

      </div>

      {/* Main */}

      <div className="flex-1 p-8 overflow-y-auto">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Recruiter Dashboard
            </h1>

            <p className="text-zinc-400 mt-2">
              AI Candidate Intelligence
            </p>

          </div>

          <div className="bg-violet-600 rounded-2xl px-8 py-5 text-center">

            <p className="text-sm uppercase">
              Match Score
            </p>

            <h2 className="text-4xl font-bold">
              {selectedCandidate.match_score}%
            </h2>

          </div>

        </div>

        <div className="space-y-8">

          <CandidateProfile
            candidate={selectedCandidate}
          />

          <div className="grid grid-cols-2 gap-8">

            <SkillsCard
              candidate={selectedCandidate}
            />

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

              <h2 className="text-xl font-bold mb-5">
                Education
              </h2>

              <div className="space-y-5">

                {selectedCandidate.education?.map((edu, index) => (

                  <div
                    key={index}
                    className="border-l-2 border-violet-500 pl-4"
                  >

                    <h3 className="font-semibold">
                      {edu.degree}
                    </h3>

                    <p className="text-zinc-400">
                      {edu.college}
                    </p>

                    <p className="text-zinc-500 text-sm">
                      {edu.year}
                    </p>

                    <p className="text-violet-400">
                      CGPA : {edu.cgpa}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

          <ProjectsCard
            candidate={selectedCandidate}
          />

          <div className="grid grid-cols-2 gap-8">

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

              <h2 className="text-xl font-bold mb-5 text-green-400">
                Strengths
              </h2>

              <ul className="space-y-3">

                {selectedCandidate.strengths?.map((item, index) => (

                  <li
                    key={index}
                    className="flex gap-3"
                  >

                    <span>✅</span>

                    <span>{item}</span>

                  </li>

                ))}

              </ul>

            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

              <h2 className="text-xl font-bold mb-5 text-red-400">
                Weaknesses
              </h2>

              <ul className="space-y-3">

                {selectedCandidate.weaknesses?.map((item, index) => (

                  <li
                    key={index}
                    className="flex gap-3"
                  >

                    <span>⚠️</span>

                    <span>{item}</span>

                  </li>

                ))}

              </ul>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}