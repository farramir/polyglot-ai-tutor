import { useState, useEffect, useCallback } from 'react';
import { AppState, LanguageProfile, Lesson, LessonContent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'polyglot_ai_tutor_v1';

const initialState: AppState = {
  profiles: [],
  activeProfileId: null,
};

export const useLanguageStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addProfile = useCallback((language: string) => {
    const newProfile: LanguageProfile = {
      id: uuidv4(),
      language,
      createdAt: Date.now(),
      knownGrammarConcepts: [],
      knownTopics: [],
      lessons: [],
    };

    setState(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: newProfile.id
    }));
  }, []);

  const selectProfile = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeProfileId: id }));
  }, []);

  const addLessonToProfile = useCallback((profileId: string, topic: string, content: LessonContent) => {
    const newLesson: Lesson = {
      id: uuidv4(),
      topic,
      content,
      timestamp: Date.now(),
      chatHistory: []
    };

    setState(prev => {
      const updatedProfiles = prev.profiles.map(p => {
        if (p.id !== profileId) return p;

        // Avoid duplicates in tracking arrays
        const newGrammar = [...p.knownGrammarConcepts];
        if (!newGrammar.includes(content.grammar.conceptName)) {
            newGrammar.push(content.grammar.conceptName);
        }

        const newTopics = [...p.knownTopics];
        if (!newTopics.includes(topic)) {
            newTopics.push(topic);
        }

        return {
          ...p,
          knownGrammarConcepts: newGrammar,
          knownTopics: newTopics,
          lessons: [newLesson, ...p.lessons] // Newest first
        };
      });

      return { ...prev, profiles: updatedProfiles };
    });
    
    return newLesson.id;
  }, []);

  const appendLessonContent = useCallback((profileId: string, lessonId: string, field: 'vocabulary' | 'idioms' | 'grammarExamples', newItems: any[]) => {
    setState(prev => {
      const updatedProfiles = prev.profiles.map(p => {
        if (p.id !== profileId) return p;
        
        const updatedLessons = p.lessons.map(l => {
          if (l.id !== lessonId) return l;
          
          const updatedContent = { ...l.content };
          
          if (field === 'vocabulary') {
             updatedContent.vocabulary = [...updatedContent.vocabulary, ...newItems];
          } else if (field === 'idioms') {
             updatedContent.idioms = [...updatedContent.idioms, ...newItems];
          } else if (field === 'grammarExamples') {
             updatedContent.grammar = {
                ...updatedContent.grammar,
                examples: [...updatedContent.grammar.examples, ...newItems]
             };
          }
          
          return { ...l, content: updatedContent };
        });

        return { ...p, lessons: updatedLessons };
      });
      return { ...prev, profiles: updatedProfiles };
    });
  }, []);

  const addChatMessage = useCallback((profileId: string, lessonId: string, message: { role: 'user' | 'model', text: string }) => {
    setState(prev => {
      const updatedProfiles = prev.profiles.map(p => {
        if (p.id !== profileId) return p;
        
        const updatedLessons = p.lessons.map(l => {
          if (l.id !== lessonId) return l;
          return {
            ...l,
            chatHistory: [...l.chatHistory, { ...message, timestamp: Date.now() }]
          };
        });

        return { ...p, lessons: updatedLessons };
      });

      return { ...prev, profiles: updatedProfiles };
    });
  }, []);

  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId) || null;

  return {
    state,
    activeProfile,
    addProfile,
    selectProfile,
    addLessonToProfile,
    appendLessonContent,
    addChatMessage
  };
};