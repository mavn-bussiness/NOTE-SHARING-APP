import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function NoteEditor({ note, refresh, cancelEdit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      if (note) {
        await API.put(`/notes/${note.id}`, { title, content });
      } else {
        await API.post('/notes', { title, content });
      }
      refresh();
      cancelEdit();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              {note ? (
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              ) : (
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              )}
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
        </div>
        <p className="text-gray-400 text-sm ml-13">
          {note ? 'Update your note content' : 'Add a new note to your board'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400">
              <path d="M5 4v3h5.5v12h3V7H19V4z"/>
            </svg>
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter a catchy title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:border-white/20"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="content" className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Content
            <span className="ml-auto text-xs text-gray-500 normal-case tracking-normal font-normal">Markdown supported</span>
          </label>
          <textarea
            id="content"
            placeholder="Write your note here... You can use markdown formatting like **bold**, *italic*, and more!"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-5 py-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all resize-vertical min-h-[250px] font-mono text-sm leading-relaxed hover:border-white/20"
            rows="12"
          />
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-[#1a1a1a]/50 rounded-lg p-3 border border-white/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400 flex-shrink-0 mt-0.5">
              <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
            </svg>
            <span>
              <strong className="text-gray-400">Markdown tips:</strong> Use # for headers, **bold**, *italic*, - for lists, [link](url) for links
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button 
            type="button" 
            onClick={cancelEdit}
            className="px-6 py-3 bg-transparent border-2 border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              {note ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              ) : (
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              )}
            </svg>
            {note ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
}