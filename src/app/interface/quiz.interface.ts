export interface Quiz {
  id?: string;
  categoryId: string;
  multiple: boolean;
  question: string;
  variants: Variant[];
  correct?: boolean;

}

export interface Variant {
  letter: string;
  variant: string;
  correct?: boolean;
}

export interface CorrectAnswer {
  letter: string;
  variant: string;
  correct: boolean;
}