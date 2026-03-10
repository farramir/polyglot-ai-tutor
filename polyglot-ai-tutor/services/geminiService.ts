import { LanguageProfile, LessonContent, ChatMessage, VocabularyItem, IdiomItem } from "../types";

// این تابع به یک سرور هوش مصنوعی کاملا رایگان متصل می‌شود و هیچ نیازی به API Key ندارد
const callFreeAI = async (prompt: string, expectJson: boolean = false): Promise<string> => {
  // اگر نیاز به دیتای ساختاریافته داریم، به هوش مصنوعی دستور اکید می‌دهیم
  const formatInstruction = expectJson 
    ? "\n\nCRITICAL: You MUST respond ONLY with valid JSON. Do not include markdown formatting like ```json." 
    : "";
  
  try {
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages:[{ role: "user", content: prompt + formatInstruction }],
        model: "openai", // از یک مدل هوشمند در بک‌گراند استفاده می‌کند
        jsonMode: expectJson,
        seed: Math.floor(Math.random() * 100000)
      })
    });

    if (!response.ok) throw new Error("Network response was not ok");
    return await response.text();
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("خطا در ارتباط با هوش مصنوعی رایگان");
  }
};

export const suggestTopics = async (language: string, knownTopics: string[]): Promise<string[]> => {
  const prompt = `I am learning ${language}. Suggest 3 creative and distinct topics for a lesson. Do NOT suggest: ${knownTopics.join(", ")}.
  Return ONLY a JSON object in this format: { "topics": ["Topic 1", "Topic 2", "Topic 3"] }`;
  
  try {
    const text = await callFreeAI(prompt, true);
    const json = JSON.parse(text);
    return json.topics || ["Daily Life", "Travel", "Food"];
  } catch (e) {
    return ["Basics of Conversation", "Shopping", "Family"];
  }
};

export const generateLesson = async (language: string, topic: string, profile: LanguageProfile): Promise<LessonContent> => {
  const prompt = `Create a language lesson about "${topic}". The user is learning ${language}. 
  Known grammar concepts: ${profile.knownGrammarConcepts.join(", ")}.
  
  Return ONLY a JSON object with this EXACT structure (No markdown, no extra text):
  {
    "title": "Catchy Title",
    "introduction": "Brief intro",
    "vocabulary":[
      {"term": "word", "translation": "english meaning", "pronunciation": "IPA", "example": "sentence"}
    ],
    "idioms":[
      {"phrase": "idiom", "translation": "meaning", "pronunciation": "IPA", "meaning": "explanation", "usage": "context"}
    ],
    "grammar": {
      "conceptName": "Concept Name",
      "explanation": "Rule explanation",
      "examples":[
        {"target": "sentence", "translation": "meaning", "pronunciation": "IPA"}
      ]
    },
    "practiceSentences":[
      {"target": "sentence", "translation": "meaning", "pronunciation": "IPA"}
    ],
    "culturalNote": "Fun fact"
  }`;

  const text = await callFreeAI(prompt, true);
  return JSON.parse(text) as LessonContent;
};

export const generateMoreVocabulary = async (language: string, topic: string, existingTerms: string[]): Promise<VocabularyItem[]> => {
  const prompt = `I am learning ${language}, studying "${topic}". Generate 5 MORE useful vocabulary words. Do not include: ${existingTerms.join(", ")}.
  Return ONLY JSON: { "items":[ {"term": "", "translation": "", "pronunciation": "", "example": ""} ] }`;
  const text = await callFreeAI(prompt, true);
  return JSON.parse(text).items ||[];
};

export const generateMoreIdioms = async (language: string, topic: string, existingPhrases: string[]): Promise<IdiomItem[]> => {
  const prompt = `I am learning ${language}, studying "${topic}". Generate 3 MORE idioms. Do not include: ${existingPhrases.join(", ")}.
  Return ONLY JSON: { "items": [ {"phrase": "", "translation": "", "pronunciation": "", "meaning": "", "usage": ""} ] }`;
  const text = await callFreeAI(prompt, true);
  return JSON.parse(text).items ||[];
};

export const generateMoreGrammarExamples = async (language: string, concept: string, existingTargets: string[]): Promise<Array<{target: string, translation: string, pronunciation: string}>> => {
  const prompt = `I am learning ${language}. Grammar concept: ${concept}. Generate 5 MORE example sentences. Do not repeat: ${existingTargets.join(", ")}.
  Return ONLY JSON: { "items": [ {"target": "", "translation": "", "pronunciation": ""} ] }`;
  const text = await callFreeAI(prompt, true);
  return JSON.parse(text).items ||[];
};

export const chatWithTutor = async (language: string, lessonContext: LessonContent, chatHistory: ChatMessage