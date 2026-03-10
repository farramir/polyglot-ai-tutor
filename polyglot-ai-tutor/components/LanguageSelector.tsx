import React, { useState, useRef, useEffect } from 'react';
import { LanguageProfile } from '../types';
import { Plus, Languages, ChevronRight } from 'lucide-react';

interface Props {
  profiles: LanguageProfile[];
  activeProfileId: string | null;
  onSelect: (id: string) => void;
  onAdd: (language: string) => void;
}

const COMMON_LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Japanese", 
  "Chinese (Mandarin)", "Russian", "Portuguese", "Korean", "Dutch", 
  "Swedish", "Polish", "Turkish", "Hindi", "Arabic", "Greek", "Hebrew"
];

export const LanguageSelector: React.FC<Props> = ({ profiles, activeProfileId, onSelect, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLang, setNewLang] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (newLang.trim()) {
      const filtered = COMMON_LANGUAGES.filter(l => 
        l.toLowerCase().startsWith(newLang.toLowerCase()) && 
        l.toLowerCase() !== newLang.toLowerCase()
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [newLang]);

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node) && isAdding) {
        setIsAdding(false);
        setNewLang("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAdding]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLang.trim()) {
      onAdd(newLang.trim());
      setNewLang("");
      setSuggestions([]);
      setIsAdding(false);
    }
  };

  const selectSuggestion = (lang: string) => {
    onAdd(lang);
    setNewLang("");
    setSuggestions([]);
    setIsAdding(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <Languages className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Polyglot AI</h1>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeProfileId === p.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.language}
            </button>
          ))}

          {isAdding ? (
            <form ref={formRef} onSubmit={handleAdd} className="flex items-center gap-2 relative">
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                placeholder="e.g. French"
                className="px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-32"
              />
              <button 
                type="submit"
                disabled={!newLang.trim()}
                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-20 overflow-hidden">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 block"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-600 text-xs px-2"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-indigo-500 hover:text-indigo-600 text-sm font-medium transition-all"
            >
              <Plus size={16} />
              <span>Add Language</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};