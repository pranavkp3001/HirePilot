import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";

export default function CandidateProfile({ email, onBack }) {
  const [candidate, setCandidate] = useState(null);
  const [graph, setGraph] = useState(null);

  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(true);

  const [error, setError] = useState("");

  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const graphRef = useRef(null);
  const graphContainerRef = useRef(null);

  const [graphWidth, setGraphWidth] = useState(1000);


  // =====================================================
  // FETCH CANDIDATE + GRAPH
  // =====================================================

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setGraphLoading(true);
        setError("");

        const encodedEmail =
          encodeURIComponent(email);

        const profileUrl =
          `http://localhost:8000/api/candidates/${encodedEmail}`;

        const graphUrl =
          `http://localhost:8000/api/candidates/${encodedEmail}/graph`;

        const [
          profileResponse,
          graphResponse
        ] = await Promise.all([
          axios.get(profileUrl),
          axios.get(graphUrl)
        ]);

        console.log(
          "Candidate Profile:",
          profileResponse.data
        );

        console.log(
          "Candidate Graph:",
          graphResponse.data
        );

        setCandidate(
          profileResponse.data.candidate
        );

        setGraph(
          graphResponse.data.graph
        );

      } catch (err) {
        console.error(
          "Candidate Profile Error:",
          err
        );

        setError(
          err.response?.data?.detail ||
          "Unable to load candidate profile."
        );
      } finally {
        setLoading(false);
        setGraphLoading(false);
      }
    }

    if (email) {
      fetchData();
    }
  }, [email]);


  // =====================================================
  // RESPONSIVE GRAPH WIDTH
  // =====================================================

  useEffect(() => {
    function updateGraphWidth() {
      if (!graphContainerRef.current) {
        return;
      }

      const width =
        graphContainerRef.current.clientWidth;

      if (width > 0) {
        setGraphWidth(width);
      }
    }

    updateGraphWidth();

    window.addEventListener(
      "resize",
      updateGraphWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateGraphWidth
      );
    };
  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-violet-400 text-xl font-semibold mt-6">
            Loading candidate profile...
          </p>

          <p className="text-zinc-500 mt-2">
            Fetching candidate data from Neo4j
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white px-8 py-10">

        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition mb-8"
        >
          ← Back to Candidates
        </button>

        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">

          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold">
            Candidate Profile Error
          </h2>

          <p className="text-zinc-500 mt-3">
            {error || "Candidate not found."}
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // GRAPH DATA
  // =====================================================

  const graphNodes =
    graph?.nodes || [];

  const graphLinks =
    graph?.relationships || [];


  const graphData = {
    nodes: graphNodes,

    links: graphLinks.map(
      (relationship) => ({
        source: relationship.source,
        target: relationship.target,
        type: relationship.type
      })
    )
  };


  // =====================================================
  // NODE COLOR
  // =====================================================

  function getNodeColor(node) {

    if (node.label === "Candidate") {
      return "#8b5cf6";
    }

    if (node.label === "Skill") {
      return "#22c55e";
    }

    if (node.label === "Project") {
      return "#3b82f6";
    }

    if (node.label === "Technology") {
      return "#f59e0b";
    }

    if (node.label === "College") {
      return "#ec4899";
    }

    return "#a1a1aa";
  }


  // =====================================================
  // NODE SIZE
  // =====================================================

  function getNodeSize(node) {

    if (node.label === "Candidate") {
      return 14;
    }

    if (node.label === "Project") {
      return 9;
    }

    if (node.label === "College") {
      return 8;
    }

    return 6;
  }


  // =====================================================
  // NODE LABEL
  // =====================================================

  function getNodeLabel(node) {
    return `${node.label}: ${node.name}`;
  }


  // =====================================================
  // CONNECTION CHECK
  // =====================================================

  function isNodeConnected(node) {

    if (!selectedNode) {
      return true;
    }

    if (
      String(node.id) ===
      String(selectedNode.id)
    ) {
      return true;
    }

    return graphData.links.some(
      (link) => {

        const sourceId =
          typeof link.source === "object"
            ? link.source.id
            : link.source;

        const targetId =
          typeof link.target === "object"
            ? link.target.id
            : link.target;

        return (
          (
            String(sourceId) ===
            String(selectedNode.id)
          &&
            String(targetId) ===
            String(node.id)
          )
          ||
          (
            String(targetId) ===
            String(selectedNode.id)
          &&
            String(sourceId) ===
            String(node.id)
          )
        );
      }
    );
  }


  // =====================================================
  // LINK CONNECTION CHECK
  // =====================================================

  function isLinkConnected(link) {

    if (!selectedNode) {
      return false;
    }

    const sourceId =
      typeof link.source === "object"
        ? link.source.id
        : link.source;

    const targetId =
      typeof link.target === "object"
        ? link.target.id
        : link.target;

    return (
      String(sourceId) ===
      String(selectedNode.id)
      ||
      String(targetId) ===
      String(selectedNode.id)
    );
  }


  // =====================================================
  // NODE CLICK
  // =====================================================

  function handleNodeClick(node) {

    setSelectedNode(node);

    if (
      graphRef.current &&
      node.x !== undefined &&
      node.y !== undefined
    ) {

      graphRef.current.centerAt(
        node.x,
        node.y,
        700
      );

      graphRef.current.zoom(
        2,
        700
      );
    }
  }


  // =====================================================
  // CLEAR GRAPH SELECTION
  // =====================================================

  function clearSelection() {
    setSelectedNode(null);
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#09090B] text-white px-6 md:px-10 py-10">

      <div className="max-w-7xl mx-auto">


        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition mb-8"
        >
          ← Back to Candidates
        </button>


        {/* ================================================= */}
        {/* CANDIDATE HEADER */}
        {/* ================================================= */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div className="flex items-center gap-6">

              <div className="h-24 w-24 rounded-2xl bg-violet-600 flex items-center justify-center text-4xl font-bold shadow-lg shadow-violet-900/20">

                {candidate.name
                  ?.charAt(0)
                  ?.toUpperCase() || "?"}

              </div>


              <div>

                <h1 className="text-4xl font-bold">
                  {candidate.name}
                </h1>

                <p className="text-violet-400 text-lg mt-2">
                  {candidate.role ||
                    "Candidate"}
                </p>

                <div className="flex flex-wrap gap-5 mt-4 text-sm text-zinc-500">

                  <span>
                    ✉ {candidate.email}
                  </span>

                  {candidate.phone && (
                    <span>
                      ☎ {candidate.phone}
                    </span>
                  )}

                </div>

              </div>

            </div>


            {/* SCORE */}

            <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl px-10 py-6 text-center">

              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Candidate Score
              </p>

              <p className="text-5xl font-bold text-violet-400 mt-2">
                {candidate.match_score ?? 0}%
              </p>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <SectionTitle>
            Professional Summary
          </SectionTitle>

          <p className="text-zinc-400 leading-8 mt-4">
            {candidate.summary ||
              "No summary available."}
          </p>

        </section>


        {/* ================================================= */}
        {/* SKILLS */}
        {/* ================================================= */}

        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <SectionTitle>
            Skills
          </SectionTitle>

          <div className="flex flex-wrap gap-3 mt-5">

            {(candidate.skills || []).map(
              (skill, index) => (

                <span
                  key={`${skill}-${index}`}
                  className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm"
                >
                  {skill}
                </span>

              )
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* EDUCATION */}
        {/* ================================================= */}

        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <SectionTitle>
            Education
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-4 mt-5">

            {(candidate.colleges || []).map(
              (college, index) => (

                <div
                  key={`${college}-${index}`}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-5"
                >

                  <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-400 mb-4">
                    🎓
                  </div>

                  <p className="text-zinc-300 font-medium">
                    {college}
                  </p>

                </div>

              )
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* PROJECTS */}
        {/* ================================================= */}

        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <SectionTitle>
            Projects
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-5 mt-5">

            {(candidate.projects || []).map(
              (project, index) => (

                <div
                  key={`${project.title}-${index}`}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/40 transition"
                >

                  <h3 className="text-xl font-semibold text-violet-400">
                    {project.title}
                  </h3>

                  <p className="text-zinc-400 leading-7 mt-4 text-sm">
                    {project.description}
                  </p>

                </div>

              )
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* TECHNOLOGIES */}
        {/* ================================================= */}

        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <SectionTitle>
            Technologies & Project Stack
          </SectionTitle>

          <div className="flex flex-wrap gap-3 mt-5">

            {(candidate.technologies || []).map(
              (technology, index) => (

                <span
                  key={`${technology}-${index}`}
                  className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm"
                >
                  {technology}
                </span>

              )
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* KNOWLEDGE GRAPH */}
        {/* ================================================= */}

        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-10">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            <div>

              <SectionTitle>
                Knowledge Graph
              </SectionTitle>

              <p className="text-zinc-500 mt-2">
                Explore the candidate's relationships
                across skills, projects, technologies
                and education.
              </p>

            </div>


            {/* LEGEND */}

            <div className="flex flex-wrap gap-4 text-xs">

              <Legend
                color="#8b5cf6"
                label="Candidate"
              />

              <Legend
                color="#22c55e"
                label="Skill"
              />

              <Legend
                color="#3b82f6"
                label="Project"
              />

              <Legend
                color="#f59e0b"
                label="Technology"
              />

              <Legend
                color="#ec4899"
                label="College"
              />

            </div>

          </div>


          {/* GRAPH */}

          <div
            ref={graphContainerRef}
            className="mt-8 rounded-2xl overflow-hidden border border-zinc-800 bg-[#050506]"
          >

            {graphLoading ? (

              <div className="h-[650px] flex items-center justify-center">

                <div className="text-center">

                  <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />

                  <p className="text-violet-400 mt-5 font-semibold">
                    Loading Knowledge Graph...
                  </p>

                </div>

              </div>

            ) : graphData.nodes.length === 0 ? (

              <div className="h-[650px] flex items-center justify-center">

                <div className="text-center">

                  <p className="text-zinc-400 text-lg">
                    No graph data available
                  </p>

                  <p className="text-zinc-600 mt-2">
                    No Neo4j relationships were found
                    for this candidate.
                  </p>

                </div>

              </div>

            ) : (

              <ForceGraph2D
                ref={graphRef}

                graphData={graphData}

                nodeId="id"

                width={graphWidth}

                height={650}

                backgroundColor="#050506"

                cooldownTicks={100}

                warmupTicks={50}

                d3AlphaDecay={0.025}

                d3VelocityDecay={0.35}

                enableZoomInteraction={true}

                enablePanInteraction={true}

                linkDirectionalArrowLength={4}

                linkDirectionalArrowRelPos={1}

                linkLabel={(link) =>
                  link.type || ""
                }

                nodeLabel={getNodeLabel}

                onNodeHover={(node) => {
                  setHoveredNode(
                    node || null
                  );
                }}

                onNodeClick={handleNodeClick}

                linkColor={(link) => {

                  if (!selectedNode) {
                    return "#3f3f46";
                  }

                  return isLinkConnected(link)
                    ? "#8b5cf6"
                    : "#18181b";
                }}

                linkWidth={(link) => {

                  if (!selectedNode) {
                    return 1.5;
                  }

                  return isLinkConnected(link)
                    ? 3
                    : 0.5;
                }}

                nodeColor={(node) =>
                  getNodeColor(node)
                }

                nodeVal={(node) =>
                  getNodeSize(node)
                }

                nodeCanvasObject={(
                  node,
                  ctx,
                  globalScale
                ) => {

                  const connected =
                    isNodeConnected(node);

                  const selected =
                    selectedNode &&
                    String(
                      selectedNode.id
                    ) ===
                      String(node.id);

                  const hovered =
                    hoveredNode &&
                    String(
                      hoveredNode.id
                    ) ===
                      String(node.id);

                  let opacity = 1;

                  if (
                    selectedNode &&
                    !connected
                  ) {
                    opacity = 0.15;
                  }

                  const radius =
                    getNodeSize(node);

                  // Glow
                  if (
                    selected ||
                    hovered
                  ) {

                    ctx.beginPath();

                    ctx.arc(
                      node.x,
                      node.y,
                      radius + 6,
                      0,
                      Math.PI * 2
                    );

                    ctx.fillStyle =
                      `${getNodeColor(node)}44`;

                    ctx.fill();
                  }

                  // Node
                  ctx.beginPath();

                  ctx.arc(
                    node.x,
                    node.y,
                    radius,
                    0,
                    Math.PI * 2
                  );

                  ctx.globalAlpha =
                    opacity;

                  ctx.fillStyle =
                    getNodeColor(node);

                  ctx.fill();

                  ctx.globalAlpha = 1;


                  // Labels
                  const showLabel =
                    node.label === "Candidate" ||
                    node.label === "Project" ||
                    selected ||
                    hovered;

                  if (showLabel) {

                    const fontSize =
                      Math.max(
                        11 /
                          globalScale,
                        5
                      );

                    ctx.font =
                      `${fontSize}px Arial`;

                    ctx.textAlign =
                      "center";

                    ctx.textBaseline =
                      "top";

                    ctx.globalAlpha =
                      opacity;

                    ctx.fillStyle =
                      "#e4e4e7";

                    ctx.fillText(
                      node.name || "",
                      node.x,
                      node.y +
                        radius +
                        4
                    );

                    ctx.globalAlpha = 1;
                  }

                }}
              />

            )}

          </div>


          {/* GRAPH CONTROLS */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">

            <p className="text-xs text-zinc-600">
              Drag nodes • Scroll to zoom • Click
              nodes to explore relationships
            </p>

            {selectedNode && (

              <button
                onClick={clearSelection}
                className="text-xs text-violet-400 hover:text-violet-300 transition"
              >
                Clear selection
              </button>

            )}

          </div>


          {/* SELECTED NODE */}

          {selectedNode && (

            <div className="mt-5 bg-zinc-950 border border-violet-500/20 rounded-xl p-5">

              <div className="flex items-center gap-3">

                <span
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor:
                      getNodeColor(
                        selectedNode
                      )
                  }}
                />

                <div>

                  <p className="text-xs uppercase tracking-widest text-zinc-600">
                    Selected Node
                  </p>

                  <p className="text-white font-semibold mt-1">
                    {selectedNode.name}
                  </p>

                </div>

              </div>

              <p className="text-sm text-zinc-500 mt-3">
                {selectedNode.label}
              </p>

            </div>

          )}

        </section>

      </div>
    </div>
  );
}


/* ========================================================= */
/* SECTION TITLE */
/* ========================================================= */

function SectionTitle({ children }) {
  return (
    <h2 className="text-2xl font-bold">
      {children}
    </h2>
  );
}


/* ========================================================= */
/* LEGEND */
/* ========================================================= */

function Legend({
  color,
  label
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: color
        }}
      />

      <span className="text-zinc-500">
        {label}
      </span>

    </div>
  );
}