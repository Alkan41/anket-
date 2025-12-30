
export interface SurveyItem {
  id: string;
  label: string;
}

export interface SurveySection {
  id: string;
  title: string;
  label: string; // a, b, c, ç
  sectionWeight: number; // The weights like 15, 5, 5...
  items: SurveyItem[];
}

export interface Question {
  id: number;
  text: string;
  sections: SurveySection[];
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  personnelName: string;
  scores: { [itemId: string]: number };
  totalScore: number;
}

export interface AppData {
  welcomeText: string;
  questions: Question[];
  personnel: string[];
  responses: SurveyResponse[];
}

export type ViewState = 'SURVEY' | 'ADMIN' | 'WELCOME' | 'ADMIN_LOGIN' | 'COMPLETED';
