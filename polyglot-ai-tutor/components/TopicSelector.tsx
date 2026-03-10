import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { suggestTopics } from '../services/geminiService';

interface Props {
  language: string;
  knownTopics: string[];
  onSelectTopic: (topic: string) => void;
}

export const TopicSelector: React.FC<Props> = ({ language, knownTopics, onSelectTopic }) => {
  const [customTopic, setCustomTopic] = useState("");
  const [randomTopics, setRandomTopics] = useState<string[] | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const handleRandomRequest = async () => {
    setIsLoadingRandom(true);
    try {
      const topics = await suggestTopics(language, knownTopics);
      setRandomTopics(topics);
    } catch (e) {
      console.error(e);
      alert("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onSelectTopic(customTopic.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          What shall we learn in <span className="text-indigo-600">{language}</span> today?
        </h2>
        <p className="text-gray-600">Choose a specific topic or let the AI guide your journey.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Custom Topic Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Specific Topic</h3>
          <p className="text-sm text-gray-500 mb-6">Have something in mind? Enter it below.</p>
          
          <form onSubmit={handleCustomSubmit} className="relative">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. At the airport..."
              className="w-full pl-4 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
            <button 
              type="submit"
              disabled={!customTopic.trim()}
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Random Topic Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Surprise Me</h3>
          <p className="text-sm text-gray-500 mb-6">Get 3 random topic suggestions based on your level.</p>
          
          {!randomTopics ? (
            <button
              onClick={handleRandomRequest}
              disabled={isLoadingRandom}
              className="w-full py-3 rounded-lg border-2 border-purple-100 text-purple-700 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoadingRandom ? <Loader2 className="animate-spin" size={20} /> : "Get Suggestions"}
            </button>
          ) : (
            <div className="space-y-2 animate-fadeIn">
              {randomTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectTopic(topic)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-sm font-medium transition-colors flex justify-between items-center group"
                >
                  {topic}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              <button 
                onClick={() => setRandomTopics(null)}
                className="text-xs text-gray-400 hover:text-gray-600 w-full text-center mt-2"
              >
                Reset suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};