import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import NoteEditor from './NoteEditor';
import DraggableNote from './DraggableNote';

export default function NoteList() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchNotes = async () => {
    const res = await API.get('/notes');
    setNotes(res.data);
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleEdit = async (updatedNote) => {
    try {
      await API.put(`/notes/${updatedNote.id}`, { 
        title: updatedNote.title, 
        content: updatedNote.content,
        size: updatedNote.size
      });
      await fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await API.delete(`/notes/${id}`);
      fetchNotes();
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingNote(null);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
  };

  const handlePositionChange = async (noteId, x, y) => {
    try {
      await API.patch(`/notes/${noteId}`, { position: { x, y } });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleSizeChange = async (noteId, width, height) => {
    try {
      await API.patch(`/notes/${noteId}`, { size: { width, height } });
    } catch (error) {
      console.error('Error updating size:', error);
    }
  };

  return (
    <div className="pt-16 md:pt-16 min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Dotted Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #4a4a4a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating Create Button - Desktop & Mobile */}
      <button
        onClick={handleCreate}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center justify-center group active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
        title="Create new note"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white group-hover:rotate-90 transition-transform duration-300">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>

      {/* Editor Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl">
            <NoteEditor 
              note={null} 
              refresh={fetchNotes} 
              cancelEdit={cancelEdit} 
            />
          </div>
        </div>
      )}

      {/* Infinite Canvas */}
      <div className="relative w-[3000px] h-[3000px]">
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-white/10 animate-fade-in max-w-md">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 mb-4 opacity-50 mx-auto">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V7h14v12zm-2-7H7v-2h10v2z"/>
              </svg>
              <h3 className="text-2xl text-white mb-2 font-bold">No notes yet</h3>
              <p className="text-gray-400 mb-6">Click the + button to create your first note</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                <span>Look for the purple button in the bottom-right corner</span>
              </div>
            </div>
          </div>
        ) : (
          notes.map((note, index) => (
            <DraggableNote
              key={note.id}
              note={note}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPositionChange={handlePositionChange}
              onSizeChange={handleSizeChange}
            />
          ))
        )}
      </div>
    </div>
  );
}