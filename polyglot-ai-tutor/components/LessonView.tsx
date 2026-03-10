import React, { useState, useEffect, useRef } from 'react';
import { Lesson, ChatMessage } from '../types';
import { Volume2, MessageSquare, Book, GraduationCap, X, Send, User, Bot, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { chatWithTutor } from '../services/geminiService';

interface Props {
  lesson: Lesson;
  language: string;
  onClose: () => void;
  onNewChatMessage: (message: { role: 'user' | 'model'; text: string }) => void;
  onLoadMore: (type: 'vocabulary' | 'idioms' | 'grammarExamples') => Promise<void>;
}

export const LessonView: React.FC<Props> = ({ lesson, language, onClose, onNewChatMessage, onLoadMore }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'chat'>('content');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { content, chatHistory } = lesson;

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    
    // Optimistic UI update
    onNewChatMessage({ role: 'user', text: userText });
    setIsSending(true);

    try {
      const response = await chatWithTutor(language, content, chatHistory, userText);
      onNewChatMessage({ role: 'model', text: response });
    } catch (error) {
      console.error("Chat error", error);
      onNewChatMessage({ role: 'model', text: "Sorry, I'm having trouble connecting right now." });
    } finally {
      setIsSending(false);
    }
  };

  const handleLoadMore = async (type: 'vocabulary' | 'idioms' | 'grammarExamples') => {
    if (loadingMore) return;
    setLoadingMore(type);
    await onLoadMore(type);
    setLoadingMore(null);
  };

  const playTTS = (text: string) => {
    window.speechSynthesis.cancel(); // Cancel any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Comprehensive language mapping
    const langMap: Record<string, string> = {
        'spanish': 'es-ES',
        'french': 'fr-FR',
        'german': 'de-DE',
        'japanese': 'ja-JP',
        'italian': 'it-IT',
        'chinese': 'zh-CN',
        'mandarin': 'zh-CN',
        'english': 'en-US',
        'russian': 'ru-RU',
        'portuguese': 'pt-BR',
        'korean': 'ko-KR',
        'dutch': 'nl-NL',
        'hindi': 'hi-IN',
        'arabic': 'ar-SA',
        'turkish': 'tr-TR',
        'polish': 'pl-PL',
        'swedish': 'sv-SE',
        'greek': 'el-GR',
        'hebrew': 'he-IL'
    };
    
    // Attempt to match the language
    const langKey = language.toLowerCase();
    let code = langMap[langKey];
    
    // Fallback: try to find a key that contains the language name (e.g., "brazilian portuguese" -> matches "portuguese")
    if (!code) {
        const foundKey = Object.keys(langMap).find(k => langKey.includes(k));
        if (foundKey) code = langMap[foundKey];
    }

    if (code) {
        utterance.lang = code;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 bg-white z-20 flex flex-col md:flex-row">
      {/* Sidebar / Navigation for Mobile */}
      <div className="bg-white border-b md:border-b-0 md:border-r border-gray-200 md:w-64 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 truncate">{content.title}</h2>
          <button onClick={onClose} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'content' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Book size={20} />
            <span className="font-medium">Lesson Material</span>
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Practice Chat</span>
          </button>
        </nav>
        
        <div className="p-4 md:block hidden">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <X size={18} />
                <span>Close Lesson</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col h-full relative">
        
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
                        {language} Lesson
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
                    <p className="text-gray-600 leading-relaxed text-lg">{content.introduction}</p>
                </div>

                {/* Vocabulary */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Book className="text-indigo-500" /> Vocabulary
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {content.vocabulary.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-indigo-700">{item.term}</h3>
                                    <button onClick={() => playTTS(item.term)} className="text-gray-400 hover:text-indigo-600">
                                        <Volume2 size={18} />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-500 mb-1 italic font-serif">{item.pronunciation}</div>
                                <p className="text-gray-800 font-medium mb-2">{item.translation}</p>
                                <p className="text-sm text-gray-600 border-t border-gray-200 pt-2 mt-2">
                                    "{item.example}"
                                </p>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => handleLoadMore('vocabulary')}
                        disabled={!!loadingMore}
                        className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {loadingMore === 'vocabulary' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Show 5 more words
                    </button>
                </div>

                {/* Grammar */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="text-purple-500" /> Grammar: {content.grammar.conceptName}
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">{content.grammar.explanation}</p>
                    <div className="space-y-4 mb-6">
                        {content.grammar.examples.map((ex, idx) => (
                            <div key={idx} className="bg-purple-50 p-4 rounded-lg flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-purple-900 text-lg">{ex.target}</span>
                                    {ex.pronunciation && (
                                      <span className="text-xs text-purple-600 font-serif italic">{ex.pronunciation}</span>
                                    )}
                                  </div>
                                  <button onClick={() => playTTS(ex.target)} className="text-purple-300 hover:text-purple-600">
                                    <Volume2 size={18} />
                                  </button>
                                </div>
                                <div className="text-purple-700 border-t border-purple-100 pt-1 mt-1">{ex.translation}</div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => handleLoadMore('grammarExamples')}
                        disabled={!!loadingMore}
                        className="w-full py-2 rounded-lg border border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {loadingMore === 'grammarExamples' ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        Show more examples
                    </button>
                </div>

                {/* Idioms */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Idioms & Expressions</h2>
                    {content.idioms.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {content.idioms.map((item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                    <div className="md:w-1/3">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-orange-800 text-lg mb-1">{item.phrase}</div>
                                            <button onClick={() => playTTS(item.phrase)} className="text-orange-300 hover:text-orange-600 shrink-0 ml-2">
                                                <Volume2 size={18} />
                                            </button>
                                        </div>
                                        {item.pronunciation && (
                                            <div className="text-orange-600 text-xs italic font-serif mb-2">{item.pronunciation}</div>
                                        )}
                                        <div className="text-orange-700 text-sm font-medium">{item.translation}</div>
                                    </div>
                                    <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-orange-200 pt-3 md:pt-0 md:pl-4">
                                        <p className="text-gray-700 mb-1"><span className="font-semibold text-orange-800">Meaning:</span> {item.meaning}</p>
                                        <p className="text-gray-600 text-sm"><span className="font-semibold text-orange-800">Usage:</span> {item.usage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic mb-6">No idioms generated yet.</p>
                    )}
                    <button 
                        onClick={() => handleLoadMore('idioms')}
                        disabled={!!loadingMore}
                        className="w-full py-3 rounded-xl border border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {loadingMore === 'idioms' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Show more idioms
                    </button>
                </div>
                
                {/* Cultural Note */}
                {content.culturalNote && (
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-blue-900">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <span className="text-xl">🌍</span> Cultural Note
                        </h3>
                        <p className="leading-relaxed">{content.culturalNote}</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full bg-white md:rounded-tl-2xl overflow-hidden shadow-inner">
            <div className="p-4 border-b border-gray-100 bg-gray-50 text-center">
                <p className="text-sm text-gray-500">Practice what you learned! Ask questions or try writing sentences.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Start the conversation...</p>
                    </div>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isSending && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                            <Bot size={14} />
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none text-gray-500">
                            <RefreshCw className="animate-spin w-4 h-4" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask about "${content.title}"...`}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isSending}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};