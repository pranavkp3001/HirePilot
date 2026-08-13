import Hero from "../components/Hero";

export default function Landing({ onUpload }) {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Hero onUpload={onUpload} />
    </main>
  );
}