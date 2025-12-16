import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, Image, Sparkles, ChevronLeft, ChevronRight, X, GripVertical, FileText } from 'lucide-react';

export default function IdeaCaptureApp() {
  const [notes, setNotes] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedNote, setDraggedNote] = useState(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const getWeekKey = (date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().split('T')[0];
  };

  const getWeekRange = (date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const formatDate = (d) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    };
    
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  const weekKey = getWeekKey(currentWeek);
  const weekNotes = notes[weekKey] || [];

  // Auto-focus on mount - simulates opening app and immediately typing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const createNote = (content) => {
    if (!content.trim()) return;
    
    const newNote = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    
    setNotes(prev => ({
      ...prev,
      [weekKey]: [...(prev[weekKey] || []), newNote]
    }));
  };

  const deleteNote = (id) => {
    setNotes(prev => ({
      ...prev,
      [weekKey]: weekNotes.filter(note => note.id !== id)
    }));
  };

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (!draggedNote) return;

    const draggedIndex = weekNotes.findIndex(n => n.id === draggedNote.id);
    if (draggedIndex === index) return;

    const newNotes = [...weekNotes];
    newNotes.splice(draggedIndex, 1);
    newNotes.splice(index, 0, draggedNote);

    setNotes(prev => ({
      ...prev,
      [weekKey]: newNotes
    }));
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const generateWeeklySummary = () => {
    if (weekNotes.length === 0) return '';
    
    return weekNotes.map((note, i) => `${i + 1}. ${note.content}`).join('\n\n');
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  if (showWeeklySummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setShowWeeklySummary(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Week Summary</h2>
            <div className="w-6" />
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{getWeekRange(currentWeek)}</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {generateWeeklySummary()}
              </p>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-right">
              {weekNotes.length} notes collected
            </div>
          </div>

          <button
            onClick={() => {
              const summary = generateWeeklySummary();
              navigator.clipboard.writeText(summary);
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigateWeek(-1)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">This Week</h2>
          <p className="text-sm text-gray-500">{getWeekRange(currentWeek)}</p>
        </div>
        <button 
          onClick={() => navigateWeek(1)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Quick Capture Area - Always visible at top */}
      <div className="bg-white rounded-3xl shadow-lg p-4 mb-6">
        <textarea
          ref={textareaRef}
          placeholder="Start writing instantly..."
          className="w-full p-3 text-base bg-transparent border-none focus:outline-none resize-none min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              createNote(e.target.value);
              e.target.value = '';
            }
          }}
          onBlur={(e) => {
            if (e.target.value.trim()) {
              createNote(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add image"
          >
            <Image className="w-5 h-5 text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voice note"
          >
            <Mic className="w-5 h-5 text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="AI extract from link"
          >
            <Sparkles className="w-5 h-5 text-gray-500" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Notes List - Drag & Drop */}
      <div className="space-y-3 mb-6">
        {weekNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No notes this week</p>
            <p className="text-gray-300 text-sm mt-1">Start typing above to capture ideas</p>
          </div>
        ) : (
          weekNotes.map((note, index) => (
            <div
              key={note.id}
              draggable
              onDragStart={(e) => handleDragStart(e, note)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-move group ${
                draggedNote?.id === note.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 whitespace-pre-wrap break-words">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{note.date}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{note.timestamp}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded flex-shrink-0"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Week Summary Button */}
      {weekNotes.length > 0 && (
        <button
          onClick={() => setShowWeeklySummary(true)}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Collect Week's Notes
        </button>
      )}
    </div>
  );
}