export interface Quiz {
  id?: string;
  categoryId: string;
  multiple: boolean;
  question: string;
  variants: Variant[];
}

export interface Variant {
  letter: string;
  variant: string;
  correct: boolean;
}
