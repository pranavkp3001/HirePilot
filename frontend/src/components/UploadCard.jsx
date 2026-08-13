import { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function UploadCard({ onUpload, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (files.length === 0) {
      alert("Please select at least one PDF.");
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);

      const response = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Backend Response:", response.data);

      onUpload(response.data.candidates);
    } catch (err) {
      console.error("Upload Error:", err);

      if (err.response) {
        console.log(err.response.data);
      }

      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <div className="w-[520px] rounded-3xl border border-zinc-700 bg-zinc-900 p-8">

        <h2 className="text-3xl font-bold text-center">
          Upload Resumes
        </h2>

        <p className="mt-2 text-center text-zinc-400">
          Select one or more PDF resumes
        </p>

        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => {
            setFiles(Array.from(e.target.files));
          }}
          style={{
            background: "white",
            color: "black",
            padding: "10px",
            display: "block",
            width: "100%",
            cursor: "pointer",
            position: "relative",
            zIndex: 99999,
          }}
        />

        {files.length > 0 && (
          <div className="mt-5 max-h-48 overflow-y-auto rounded-lg bg-zinc-800 p-4">

            <p className="font-semibold text-violet-400 mb-3">
              {files.length} Resume(s) Selected
            </p>

            <ul className="space-y-2 text-sm text-zinc-300">
              {files.map((file, index) => (
                <li key={index}>
                  📄 {file.name}
                </li>
              ))}
            </ul>

          </div>
        )}

        <div className="mt-8 flex gap-4">

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-700 py-4"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 rounded-xl bg-violet-600 py-4 font-semibold hover:bg-violet-500 transition"
          >
            {loading
              ? `Uploading ${files.length} Resume(s)...`
              : "Analyze Resumes"}
          </button>

        </div>

      </div>
    </motion.div>
  );
}