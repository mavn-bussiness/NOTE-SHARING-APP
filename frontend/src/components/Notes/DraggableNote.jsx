import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import ReactMarkdown from 'react-markdown';
import 'react-resizable/css/styles.css';

export default function DraggableNote({ note, index, onEdit, onDelete, onPositionChange, onSizeChange }) {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content || '');
  const [size, setSize] = useState(note.size || { width: 280, height: 320 }); // Smaller default

  const getDefaultPosition = () => {
    if (note.position && typeof note.position.x === 'number' && typeof note.position.y === 'number') {
      return { x: note.position.x, y: note.position.y };
    }
    const offsetX = (index % 5) * 60 + 120;
    const offsetY = Math.floor(index / 5) * 80 + 120;
    return { x: offsetX, y: offsetY };
  };

  const [position, setPosition] = useState(getDefaultPosition());

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    onPositionChange(note.id, data.x, data.y);
  };

  const handleResizeStop = (e, { size: newSize }) => {
    const updatedSize = { 
      width: Math.max(240, newSize.width), 
      height: Math.max(280, newSize.height) 
    };
    setSize(updatedSize);
    onSizeChange(note.id, updatedSize.width, updatedSize.height);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return alert('Title cannot be empty');
    await onEdit({ ...note, title: editTitle, content: editContent, size });
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const colors = [
    'from-yellow-400/20 to-yellow-500/10 border-yellow-500/30',
    'from-pink-400/20 to-pink-500/10 border-pink-500/30',
    'from-blue-400/20 to-blue-500/10 border-blue-500/30',
    'from-green-400/20 to-green-500/10 border-green-500/30',
    'from-purple-400/20 to-purple-500/10 border-purple-500/30',
  ];
  const colorClass = colors[note.id % colors.length];

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={handleDragStop}
      handle=".drag-handle"
      disabled={isEditing}
    >
      <div ref={nodeRef} className="absolute cursor-move">
        <Resizable
          width={size.width}
          height={size.height}
          onResizeStop={handleResizeStop}
          minConstraints={[240, 280]}
          maxConstraints={[600, 700]}
          resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'e']}
        >
          <div 
            className={`bg-gradient-to-br ${colorClass} backdrop-blur-md rounded-xl shadow-2xl border-2 transition-all hover:shadow-3xl overflow-hidden flex flex-col ${isEditing ? 'ring-4 ring-white/20' : ''}`}
            style={{ width: `${size.width}px`, height: `${size.height}px` }}
          >
            {/* Header - More Compact */}
            <div className={`drag-handle px-4 py-3 border-b border-white/10 flex justify-between items-center flex-shrink-0 ${isEditing ? 'cursor-default bg-black/10' : 'cursor-grab active:cursor-grabbing hover:bg-white/5'} transition-colors`}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70 hover:bg-green-500 transition-colors cursor-pointer" onClick={handleEditClick}></div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={handleEditClick} 
                      className="p-1.5 hover:bg-white/10 rounded-md transition-all active:scale-95" 
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70 hover:text-white">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} 
                      className="p-1.5 hover:bg-red-500/20 rounded-md transition-all active:scale-95" 
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70 hover:text-red-400">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleSave} 
                      className="p-1.5 hover:bg-green-500/20 rounded-md transition-all active:scale-95" 
                      title="Save"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-400 hover:text-green-300">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="p-1.5 hover:bg-red-500/20 rounded-md transition-all active:scale-95" 
                      title="Cancel"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 hover:text-red-300">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {isEditing ? (
                <div className="p-4 space-y-3 flex flex-col h-full">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border-2 border-white/20 rounded-lg text-white text-base font-bold placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 transition-all"
                    placeholder="Note title..."
                    autoFocus
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 w-full px-3 py-2 bg-black/20 border-2 border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 resize-none font-mono leading-relaxed transition-all"
                    placeholder="Note content (Markdown supported)..."
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-base font-bold text-white mb-3 break-words leading-tight border-b border-white/10 pb-2">
                    {note.title}
                  </h3>
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-p:text-gray-100 prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-sm
                    prose-headings:text-white prose-headings:my-2 prose-headings:font-bold
                    prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                    prose-ul:my-1.5 prose-ul:text-gray-100 prose-ul:text-sm
                    prose-ol:my-1.5 prose-ol:text-gray-100 prose-ol:text-sm
                    prose-li:my-0.5 prose-li:text-gray-100 prose-li:text-sm
                    prose-strong:text-white prose-strong:font-bold
                    prose-em:text-gray-200 prose-em:italic
                    prose-code:bg-black/30 prose-code:text-purple-300 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                    prose-pre:bg-black/40 prose-pre:p-2 prose-pre:rounded-lg prose-pre:border prose-pre:border-white/10 prose-pre:text-xs
                    prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-gray-300 prose-blockquote:text-sm
                    prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300 prose-a:text-sm
                    break-words">
                    {note.content ? (
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    ) : (
                      <p className="text-gray-400 italic text-sm">No content yet...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - More Compact */}
            {!isEditing && note.updated_at && (
              <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs text-white/50 bg-black/5 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span className="text-xs">{formatDate(note.updated_at)}</span>
                </div>
                <div className="text-white/30 text-xs">
                  {size.width}×{size.height}
                </div>
              </div>
            )}
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}