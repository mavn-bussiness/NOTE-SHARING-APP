import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import ReactMarkdown from "react-markdown";
import {
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";

export default function Note({
  note,
  index,
  onEdit,
  onDelete,
  onPositionChange,
  onSizeChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [size, setSize] = useState(note.size || { width: 240, height: 180 });
  const [position, setPosition] = useState(
    note.position || {
      x: (index % 4) * 280 + 100,
      y: Math.floor(index / 4) * 200 + 100,
    }
  );

  const contentRef = useRef(null);

  // Adjust height automatically based on content when not manually resized
  useEffect(() => {
    if (contentRef.current && !isEditing) {
      const textHeight = contentRef.current.scrollHeight;
      const baseHeight = Math.max(180, textHeight + 100);
      setSize((prev) => ({ ...prev, height: baseHeight }));
    }
  }, [content, isEditing]);

  const handleSave = async () => {
    if (!title.trim()) return alert("Title cannot be empty");
    await onEdit({ ...note, title, content, size });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const colors = [
    "from-emerald-600/20 to-emerald-500/10 border-emerald-500/40",
    "from-violet-600/20 to-violet-500/10 border-violet-500/40",
    "from-rose-600/20 to-rose-500/10 border-rose-500/40",
    "from-blue-600/20 to-blue-500/10 border-blue-500/40",
    "from-amber-600/20 to-amber-500/10 border-amber-500/40",
  ];
  const colorClass = colors[note.id % colors.length];

  return (
  <Rnd
    bounds="window"
    size={size}
    position={position}
    minWidth={220}
    minHeight={150}
    enableResizing={!isEditing}
    onDragStop={(e, d) => {
      const newPos = { x: d.x, y: d.y };
      setPosition(newPos);
      onPositionChange(note.id, newPos.x, newPos.y);
    }}
    onResizeStop={(e, dir, ref, delta, pos) => {
      const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
      setSize(newSize);
      setPosition(pos);
      onSizeChange(note.id, newSize.width, newSize.height);
    }}
    className={`bg-gradient-to-br ${colorClass} backdrop-blur-lg rounded-xl shadow-lg border overflow-hidden transition-all hover:shadow-xl`}
  >
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div
        className={`flex justify-between items-center px-3 py-2 border-b border-white/10 ${
          isEditing ? "bg-black/10" : ""
        }`}
      >
        <h3 className="text-white font-semibold truncate">
          {title || "Untitled"}
        </h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="hover:text-white text-white/70 transition"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="hover:text-red-400 text-red-300 transition"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="hover:text-green-400 text-green-300 transition"
                title="Save"
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="hover:text-red-400 text-red-300 transition"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-3" ref={contentRef}>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-white/20 outline-none"
              placeholder="Enter a title..."
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[120px] bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm placeholder-white/40 resize-none focus:ring-2 focus:ring-white/20 outline-none"
              placeholder="Write your thoughts here... Markdown supported"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-100 prose prose-invert prose-p:my-1 prose-p:leading-relaxed">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="italic text-gray-400">No content yet...</p>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
  <div className="px-3 py-2 border-t border-white/10 text-xs text-white/60 bg-black/10 flex justify-between items-center flex-shrink-0">
    <span>
      {note.updated_at && note.updated_at !== note.created_at
        ? `Edited · ${formatDate(note.updated_at)}`
        : `Created · ${formatDate(note.created_at)}`}
    </span>
  </div>
)}
    </div>
  </Rnd>
); 
}
