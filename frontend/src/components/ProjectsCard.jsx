export default function ProjectsCard({ candidate }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

      <h2 className="text-xl font-bold mb-5">
        Projects
      </h2>

      <div className="space-y-5">

        {candidate.projects?.map((project, index) => (

          <div
            key={index}
            className="bg-zinc-800 rounded-xl p-5"
          >

            <h3 className="text-violet-400 font-semibold">
              {project.title}
            </h3>

            <p className="mt-3 text-zinc-300">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">

              {project.tech_stack?.map((tech, i) => (

                <span
                  key={i}
                  className="text-xs bg-black border border-zinc-700 rounded-full px-3 py-1"
                >
                  {tech}
                </span>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}