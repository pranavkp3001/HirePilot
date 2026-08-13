import { useState } from "react";
import axios from "axios";

export default function JDMatcher({
  onViewCandidate,
}) {
  const [jobDescription, setJobDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [results, setResults] =
    useState(null);


  async function handleSubmit(e) {
    e.preventDefault();

    if (!jobDescription.trim()) {
      alert(
        "Please enter a job description."
      );

      return;
    }

    try {

      setLoading(true);

      setResults(null);

      const formData = new FormData();

      formData.append(
        "job_description",
        jobDescription
      );

      const response = await axios.post(
        "http://localhost:8000/api/match",
        formData
      );

      console.log(
        "JD Match Response:",
        response.data
      );

      setResults(
        response.data
      );

    } catch (err) {

      console.error(
        "JD Matching Error:",
        err
      );

      if (err.response) {

        console.error(
          "Backend Response:",
          err.response.data
        );

      }

      alert(
        "JD matching failed."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="
      min-h-screen
      bg-[#09090B]
      text-white
      px-10
      py-10
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10">

          <h1 className="
            text-5xl
            font-bold
          ">
            JD Matcher
          </h1>

          <p className="
            text-zinc-400
            mt-3
            text-lg
          ">
            Find and rank the best candidates using
            semantic retrieval, knowledge graphs,
            and AI-powered evaluation.
          </p>

        </div>


        {/* ================================================= */}
        {/* JOB DESCRIPTION */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-8
          "
        >

          <h2 className="
            text-2xl
            font-semibold
            mb-5
          ">
            Job Description
          </h2>

          <textarea
            rows={12}
            placeholder="Paste the Job Description here..."
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(
                e.target.value
              )
            }
            className="
              w-full
              bg-zinc-950
              border
              border-zinc-700
              rounded-xl
              p-5
              text-white
              outline-none
              focus:border-violet-500
              resize-none
            "
          />

          <div className="
            flex
            justify-end
            mt-5
          ">

            <button
              type="submit"
              disabled={loading}
              className="
                bg-violet-600
                hover:bg-violet-500
                disabled:opacity-50
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
              "
            >
              {loading
                ? "Finding Candidates..."
                : "Find Best Candidates"}
            </button>

          </div>

        </form>


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (

          <div className="
            mt-10
            text-center
          ">

            <div className="
              text-violet-400
              text-lg
            ">
              Analyzing candidate pool...
            </div>

            <p className="
              text-zinc-500
              mt-2
            ">
              ChromaDB → Neo4j → Gemini → Hybrid Ranking
            </p>

          </div>

        )}


        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        {results && (

          <div className="mt-10">

            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <div>

                <h2 className="
                  text-3xl
                  font-bold
                ">
                  Candidate Matches
                </h2>

                <p className="
                  text-zinc-400
                  mt-1
                ">
                  {results.count || 0} candidates analyzed
                </p>

              </div>

            </div>


            {/* ================================================= */}
            {/* NO RESULTS */}
            {/* ================================================= */}

            {results.count === 0 && (

              <div className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                p-8
                text-center
              ">

                <h3 className="
                  text-xl
                  font-semibold
                ">
                  No candidates found
                </h3>

                <p className="
                  text-zinc-500
                  mt-2
                ">
                  Try using a broader job description.
                </p>

              </div>

            )}


            {/* ================================================= */}
            {/* CANDIDATES */}
            {/* ================================================= */}

            <div className="
              space-y-8
            ">

              {results.results?.map(
                (item, index) => {

                  const candidate =
                    item.candidate || {};

                  const match =
                    item.match || {};

                  const scores =
                    item.scores || {};

                  const comparisonFailed =
                    item.comparison_failed === true;


                  return (

                    <div
                      key={
                        candidate.email ||
                        index
                      }
                      className="
                        bg-zinc-900
                        border
                        border-zinc-800
                        rounded-2xl
                        p-8
                      "
                    >

                      {/* ===================================== */}
                      {/* HEADER */}
                      {/* ===================================== */}

                      <div className="
                        flex
                        items-center
                        justify-between
                      ">

                        <div className="
                          flex
                          items-center
                          gap-5
                        ">

                          <div className="
                            h-16
                            w-16
                            rounded-full
                            bg-violet-600
                            flex
                            items-center
                            justify-center
                            text-2xl
                            font-bold
                          ">
                            {candidate.name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>


                          <div>

                            <h3 className="
                              text-2xl
                              font-bold
                            ">
                              {candidate.name ||
                                "Unknown Candidate"}
                            </h3>

                            <p className="
                              text-violet-400
                              mt-1
                            ">
                              {candidate.recommended_role ||
                                "Candidate"}
                            </p>

                            <p className="
                              text-zinc-500
                              text-sm
                              mt-1
                            ">
                              {candidate.email}
                            </p>

                          </div>

                        </div>


                        {/* FINAL SCORE */}

                        <div className="
                          text-center
                          bg-violet-600/20
                          border
                          border-violet-500/30
                          rounded-2xl
                          px-8
                          py-4
                        ">

                          <p className="
                            text-xs
                            uppercase
                            tracking-wider
                            text-zinc-400
                          ">
                            Final Match
                          </p>

                          <p className="
                            text-4xl
                            font-bold
                            text-violet-400
                          ">
                            {comparisonFailed
                              ? "N/A"
                              : `${scores.final_score ?? 0}%`}
                          </p>

                        </div>

                      </div>


                      {/* ===================================== */}
                      {/* VIEW PROFILE */}
                      {/* ===================================== */}

                      <button
                        onClick={() =>
                          onViewCandidate(
                            candidate.email
                          )
                        }
                        className="
                          mt-6
                          w-full
                          border
                          border-violet-500/30
                          bg-violet-500/10
                          hover:bg-violet-500/20
                          text-violet-400
                          py-3
                          rounded-xl
                          font-semibold
                          transition
                        "
                      >
                        View Candidate Profile →
                      </button>


                      {/* ===================================== */}
                      {/* FAILED */}
                      {/* ===================================== */}

                      {comparisonFailed && (

                        <div className="
                          mt-6
                          bg-yellow-500/10
                          border
                          border-yellow-500/20
                          rounded-xl
                          p-5
                        ">

                          <h4 className="
                            font-semibold
                            text-yellow-400
                            mb-2
                          ">
                            AI Comparison Unavailable
                          </h4>

                          <p className="
                            text-zinc-400
                          ">
                            Gemini could not complete the
                            comparison for this candidate.
                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* SCORE BREAKDOWN */}
                      {/* ===================================== */}

                      {!comparisonFailed && (

                        <div className="mt-8">

                          <h4 className="
                            text-lg
                            font-semibold
                            mb-4
                          ">
                            Match Breakdown
                          </h4>

                          <div className="
                            grid
                            grid-cols-3
                            gap-4
                          ">

                            <ScoreCard
                              label="AI Evaluation"
                              value={
                                scores.ai_score
                              }
                            />

                            <ScoreCard
                              label="Skill Coverage"
                              value={
                                scores.skill_score
                              }
                            />

                            <ScoreCard
                              label="Semantic Relevance"
                              value={
                                scores.retrieval_score
                              }
                            />

                          </div>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* MATCHING SKILLS */}
                      {/* ===================================== */}

                      {!comparisonFailed && (

                        <div className="
                          mt-8
                        ">

                          <h4 className="
                            text-lg
                            font-semibold
                            mb-4
                          ">
                            Matching Skills
                          </h4>

                          <div className="
                            flex
                            flex-wrap
                            gap-2
                          ">

                            {(
                              match.matching_skills ||
                              []
                            ).map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  key={skillIndex}
                                  className="
                                    px-3
                                    py-1.5
                                    rounded-full
                                    bg-green-500/10
                                    border
                                    border-green-500/20
                                    text-green-400
                                    text-sm
                                  "
                                >
                                  ✓ {skill}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* MISSING SKILLS */}
                      {/* ===================================== */}

                      {!comparisonFailed && (

                        <div className="
                          mt-7
                        ">

                          <h4 className="
                            text-lg
                            font-semibold
                            mb-4
                          ">
                            Missing Skills
                          </h4>

                          <div className="
                            flex
                            flex-wrap
                            gap-2
                          ">

                            {(
                              match.missing_skills ||
                              []
                            ).length === 0 ? (

                              <span className="
                                text-green-400
                              ">
                                ✓ No major skill gaps
                              </span>

                            ) : (

                              (
                                match.missing_skills ||
                                []
                              ).map(
                                (
                                  skill,
                                  skillIndex
                                ) => (

                                  <span
                                    key={skillIndex}
                                    className="
                                      px-3
                                      py-1.5
                                      rounded-full
                                      bg-red-500/10
                                      border
                                      border-red-500/20
                                      text-red-400
                                      text-sm
                                    "
                                  >
                                    {skill}
                                  </span>

                                )
                              )

                            )}

                          </div>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* RECOMMENDATION */}
                      {/* ===================================== */}

                      {!comparisonFailed && (

                        <div className="
                          mt-8
                          bg-violet-600/10
                          border
                          border-violet-500/20
                          rounded-xl
                          p-5
                        ">

                          <h4 className="
                            font-semibold
                            text-violet-400
                            mb-2
                          ">
                            AI Recommendation
                          </h4>

                          <p className="
                            text-zinc-300
                            leading-7
                          ">
                            {match.recommendation ||
                              "No recommendation available."}
                          </p>

                        </div>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


/* ========================================================= */
/* SCORE CARD */
/* ========================================================= */

function ScoreCard({
  label,
  value,
}) {

  return (

    <div className="
      bg-zinc-950
      border
      border-zinc-800
      rounded-xl
      p-5
    ">

      <p className="
        text-sm
        text-zinc-500
      ">
        {label}
      </p>

      <p className="
        text-2xl
        font-bold
        mt-2
      ">
        {value ?? 0}%
      </p>

    </div>

  );
}