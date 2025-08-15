import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const [showFullText, setShowFullText] = useState(false);
  
  const shortDescription = note.description.length > 100 
    ? note.description.slice(0, 100) + '...'
    : note.description;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 h-64 flex flex-col">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-lg text-gray-800 truncate" title={note.subject}>
          {note.subject}
        </h3>
        <small className="text-gray-500 text-xs">
          {formatDate(note.createdAt)}
        </small>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="p-4 flex-1">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {showFullText ? note.description : shortDescription}
          </p>
          
          {note.description.length > 100 && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
            >
              {showFullText ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* Divider + Actions Section */}
        <div className="border-t-2 border-gray-300 bg-gray-50 p-3 flex justify-end space-x-2 rounded-b-xl">
          <button
            onClick={() => onEdit(note)}
            className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm"
            title="Edit note"
          >
            <Edit size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="flex items-center space-x-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm"
            title="Delete note"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
