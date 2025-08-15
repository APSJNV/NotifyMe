import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NoteForm = ({ note, onSubmit, onCancel }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (note) {
      setSubject(note.subject);
      setDescription(note.description);
    } else {
      setSubject('');
      setDescription('');
    }
  }, [note]);

  const handleSubmit = () => {
    if (subject.trim() && description.trim()) {
      onSubmit(note?._id, { subject: subject.trim(), description: description.trim() });
      setSubject('');
      setDescription('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {note ? 'Edit Note' : 'Create New Note'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-500" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              placeholder="Enter note subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Write your note here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!subject.trim() || !description.trim()}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {note ? 'Update Note' : 'Create Note'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <span className="font-semibold">Ctrl + Enter</span> to save
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoteForm;
