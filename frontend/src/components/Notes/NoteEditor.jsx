import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";


export default function NoteEditor({ note, refresh, cancelEdit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") cancelEdit();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cancelEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      if (note) {
        await API.put(`/notes/${note.id}`, { title, content });
      } else {
        await API.post("/notes", { title, content });
      }
      refresh();
      cancelEdit();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={cancelEdit}
      >
        <motion.div
          className="w-full max-w-2xl bg-[#1a1a1b] rounded-md shadow-xl mt-12 mb-12"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#343536]">
            <h2 className="text-lg font-medium text-white">
              {note ? "Edit note" : "Create note"}
            </h2>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-white transition"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 mb-3 bg-[#272729] border border-[#343536] rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
              autoFocus
            />

            {/* Content */}
            <textarea
              ref={textareaRef}
              placeholder="Body text (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[200px] px-4 py-3 bg-[#272729] border border-[#343536] rounded text-white placeholder-gray-500 focus:outline-none focus:border-white resize-none transition"
              rows="8"
            />

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 text-sm font-bold text-white hover:bg-[#272729] rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition disabled:opacity-50"
                disabled={!title.trim()}
              >
                {note ? "Save" : "Post"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}