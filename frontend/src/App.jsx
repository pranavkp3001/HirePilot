import { useState } from "react";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import JDMatcher from "./components/JDMatcher";
import CandidateProfile from "./components/CandidateProfile";


function App() {

  const [page, setPage] =
    useState("upload");

  const [candidate, setCandidate] =
    useState(null);

  const [candidates, setCandidates] =
    useState([]);

  const [selectedCandidateEmail, setSelectedCandidateEmail] =
    useState(null);


  // =====================================================
  // RESUME UPLOAD
  // =====================================================

  const handleUpload = (data) => {

    setCandidate(data);

    setCandidates((prev) => {

      const exists = prev.find(
        (c) =>
          c.email === data.email
      );

      if (exists) {
        return prev;
      }

      return [
        ...prev,
        data
      ];

    });

    setPage("dashboard");
  };


  // =====================================================
  // OPEN CANDIDATE PROFILE
  // =====================================================

  const handleViewCandidate = (
    email
  ) => {

    setSelectedCandidateEmail(
      email
    );

    setPage("profile");
  };


  // =====================================================
  // BACK TO JD MATCHER
  // =====================================================

  const handleBackToMatcher = () => {

    setSelectedCandidateEmail(
      null
    );

    setPage("matcher");
  };


  return (

    <div className="
      min-h-screen
      bg-[#09090B]
      text-white
    ">


      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <nav className="
        flex
        justify-between
        items-center
        px-10
        py-5
        border-b
        border-zinc-800
      ">

        <button
          onClick={() =>
            setPage("upload")
          }
          className="
            text-3xl
            font-bold
            text-violet-500
          "
        >
          HirePilot
        </button>


        <div className="
          flex
          gap-4
        ">

          <button
            onClick={() =>
              setPage("upload")
            }
            className="
              bg-zinc-800
              hover:bg-zinc-700
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            Upload Resume
          </button>


          <button
            onClick={() =>
              setPage("dashboard")
            }
            disabled={!candidate}
            className="
              bg-zinc-800
              hover:bg-zinc-700
              disabled:opacity-40
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            Dashboard
          </button>


          <button
            onClick={() =>
              setPage("matcher")
            }
            className="
              bg-violet-600
              hover:bg-violet-500
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            JD Matcher
          </button>

        </div>

      </nav>


      {/* ================================================= */}
      {/* UPLOAD */}
      {/* ================================================= */}

      {page === "upload" && (

        <Landing
          onUpload={
            handleUpload
          }
        />

      )}


      {/* ================================================= */}
      {/* DASHBOARD */}
      {/* ================================================= */}

      {page === "dashboard" &&
        candidate && (

          <Dashboard
            candidate={candidate}
            candidates={candidates}
          />

        )}


      {/* ================================================= */}
      {/* JD MATCHER */}
      {/* ================================================= */}

      {page === "matcher" && (

        <JDMatcher
          onViewCandidate={
            handleViewCandidate
          }
        />

      )}


      {/* ================================================= */}
      {/* CANDIDATE PROFILE */}
      {/* ================================================= */}

      {page === "profile" &&
        selectedCandidateEmail && (

          <CandidateProfile
            email={
              selectedCandidateEmail
            }
            onBack={
              handleBackToMatcher
            }
          />

        )}

    </div>

  );
}


export default App;