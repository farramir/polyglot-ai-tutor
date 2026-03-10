import React, { useState } from 'react';
import { useLanguageStore } from './hooks/useLanguageStore';
import { LanguageSelector } from './components/LanguageSelector';
import { TopicSelector } from './components/TopicSelector';
import { LessonView } from './components/LessonView';
import { generateLesson, generateMoreVocabulary, generateMoreIdioms, generateMoreGrammarExamples } from './services/geminiService';
import { LessonContent } from './types';
import { Loader2, BookOpen, CheckCircle, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const { 
    state, 
    activeProfile, 
    addProfile, 
    selectProfile, 
    addLessonToProfile,
    appendLessonContent,
    addChatMessage 
  } = useLanguageStore();

  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const handleCreateLesson = async (topic: string) => {
    if (!activeProfile) return;
    
    setIsLoadingLesson(true);
    try {
      const content = await generateLesson(activeProfile.language, topic, activeProfile);
      const lessonId = addLessonToProfile(activeProfile.id, topic, content);
      setCurrentLessonId(lessonId);
    } catch (error) {
      console.error("Failed to generate lesson", error);
      alert("Something went wrong while creating the lesson. Please try again.");
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const handleAppendContent = async (type: 'vocabulary' | 'idioms' | 'grammarExamples') => {
    if (!activeProfile || !currentLessonId) return;
    const activeLesson = activeProfile.lessons.find(l => l.id === currentLessonId);
    if (!activeLesson) return;

    try {
        let newItems = [];
        if (type === 'vocabulary') {
            const existing = activeLesson.content.vocabulary.map(v => v.term);
            newItems = await generateMoreVocabulary(activeProfile.language, activeLesson.topic, existing);
        } else if (type === 'idioms') {
            const existing = activeLesson.content.idioms.map(i => i.phrase);
            newItems = await generateMoreIdioms(activeProfile.language, activeLesson.topic, existing);
        } else if (type === 'grammarExamples') {
            const existing = activeLesson.content.grammar.examples.map(e => e.target);
            newItems = await generateMoreGrammarExamples(activeProfile.language, activeLesson.content.grammar.conceptName, existing);
        }

        if (newItems.length > 0) {
            appendLessonContent(activeProfile.id, currentLessonId, type, newItems);
        }
    } catch (e) {
        console.error("Failed to load more content", e);
        alert("Could not load more content at this time.");
    }
  };

  const handleCloseLesson = () => {
    setCurrentLessonId(null);
  };

  const activeLesson = activeProfile?.lessons.find(l => l.id === currentLessonId);

  // Loading Screen
  if (isLoadingLesson && activeProfile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white relative z-10 shadow-xl">
             <BrainCircuit size={40} className="animate-pulse" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-gray-900">Crafting your lesson...</h2>
        <p className="mt-2 text-gray-500">Reviewing your history in {activeProfile.language} to customize the content.</p>
      </div>
    );
  }

  // Active Lesson View
  if (activeLesson && activeProfile) {
    return (
      <LessonView 
        lesson={activeLesson}
        language={activeProfile.language}
        onClose={handleCloseLesson}
        onNewChatMessage={(msg) => activeProfile && currentLessonId && addChatMessage(activeProfile.id, currentLessonId, msg)}
        onLoadMore={handleAppendContent}
      />
    );
  }

  // Dashboard / Home
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LanguageSelector 
        profiles={state.profiles}
        activeProfileId={state.activeProfileId}
        onSelect={selectProfile}
        onAdd={addProfile}
      />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        {!activeProfile ? (
          <div className="text-center mt-20 max-w-lg mx-auto">
             <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 mx-auto flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-indigo-300" />
             </div>
             <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Welcome to Polyglot AI</h2>
             <p className="text-lg text-gray-600 mb-8">
               Start your journey by adding a language you want to learn above. 
               The AI will track your progress and adapt lessons to you.
             </p>
          </div>
        ) : (
          <div className="space-y-12 animate-fadeIn">
            
            {/* Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Lessons</div>
                  <div className="text-2xl font-bold text-gray-900">{activeProfile.lessons.length}</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Grammar Points</div>
                  <div className="text-2xl font-bold text-indigo-600">{activeProfile.knownGrammarConcepts.length}</div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm col-span-2">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Last Topic</div>
                  <div className="text-lg font-medium text-gray-800 truncate">
                    {activeProfile.knownTopics[activeProfile.knownTopics.length - 1] || "None yet"}
                  </div>
               </div>
            </div>

            {/* Main Selection Area */}
            <TopicSelector 
              language={activeProfile.language}
              knownTopics={activeProfile.knownTopics}
              onSelectTopic={handleCreateLesson}
            />

            {/* History List */}
            {activeProfile.lessons.length > 0 && (
               <div className="mt-16">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" /> Recent Lessons
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {activeProfile.lessons.slice(0, 6).map((lesson) => (
                        <button 
                           key={lesson.id}
                           onClick={() => setCurrentLessonId(lesson.id)}
                           className="text-left bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all group"
                        >
                           <div className="text-xs text-gray-400 mb-1">
                              {new Date(lesson.timestamp).toLocaleDateString()}
                           </div>
                           <div className="font-semibold text-gray-800 group-hover:text-indigo-700">
                              {lesson.topic}
                           </div>
                           <div className="text-sm text-gray-500 mt-2 truncate">
                              {lesson.content.grammar.conceptName}
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;