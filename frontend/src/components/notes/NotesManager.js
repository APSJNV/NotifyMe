import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NoteForm from './NoteForm';
import NoteCard from './NoteCard';
import { Plus, Search, Bell } from 'lucide-react';

const NotesManager = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/notes',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchNotes = async () => {
    try {
      const res = await api.get('/');
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const searchNotes = async () => {
    if (!search.trim()) return fetchNotes();
    try {
      const res = await api.get(`/search/${search}`);
      setNotes(res.data);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };

  const saveNote = async (id, data) => {
    try {
      if (id) {
        await api.put(`/${id}`, data);
      } else {
        await api.post('/', data);
      }
      fetchNotes();
      setShowForm(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/${id}`);
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(note =>
    note.subject.toLowerCase().includes(search.toLowerCase()) ||
    note.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { fetchNotes(); }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Notes</h2>
          <p className="text-gray-600 text-sm">Organize your thoughts and ideas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={14} />
          <span>Add Note</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={16} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchNotes()}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
        />
      </div>

      {/* Notes Grid */}
{filteredNotes.length > 0 ? (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-blue-50 p-6 rounded-xl shadow-inner">
    {filteredNotes.map((note) => (
      <NoteCard
        key={note._id}
        note={note}
        onEdit={handleEdit}
        onDelete={deleteNote}
      />
    ))}
  </div>
) : (
  <div className="text-center py-12 bg-blue-50 rounded-xl shadow-inner">
    <div className="text-gray-400 mb-4 flex justify-center">
      <Bell size={48} />
    </div>
    <h3 className="text-lg font-medium text-gray-600 mb-2">No notes found</h3>
    <p className="text-gray-500">
      {search ? 'Try adjusting your search terms' : 'Create your first note to get started'}
    </p>
  </div>
)}


      {/* Note Form Modal */}
      {showForm && (
        <NoteForm
          note={editingNote}
          onSubmit={saveNote}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default NotesManager;