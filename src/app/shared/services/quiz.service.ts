import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, where, addDoc, doc, updateDoc, deleteDoc, setDoc , writeBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Quiz, Variant } from '../../interface/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizzesCollection: CollectionReference<Quiz>;

  constructor(private firestore: Firestore) {
    this.quizzesCollection = collection(this.firestore, 'quizzes') as CollectionReference<Quiz>;
  }

  getQuizzes(): Observable<Quiz[]> {
    return collectionData(this.quizzesCollection, { idField: 'id' }) as Observable<Quiz[]>;
  }

  getQuizzesByCategory(categoryId: string): Observable<Quiz[]> {
    const quizzesByCategoryQuery = query(this.quizzesCollection, where('categoryId', '==', categoryId));
    return collectionData(quizzesByCategoryQuery, { idField: 'id' }) as Observable<Quiz[]>;
  }

  addQuiz(quizData: Quiz): Promise<any> {
    return addDoc(this.quizzesCollection, quizData);
  }

  updateQuiz(quizData: Quiz): Promise<void> {
    const quizDocRef = doc(this.firestore, `quizzes/${quizData.id}`);
    return updateDoc(quizDocRef, {
      question: quizData.question,
      categoryId: quizData.categoryId,
      variants: quizData.variants
    });
  }

  deleteQuiz(id: string): Promise<void> {
    const quizDocRef = doc(this.firestore, `quizzes/${id}`);
    return deleteDoc(quizDocRef);
  }

  async addCorrects(quizId: string, correctVariants: Variant[]): Promise<void> {
    for (let i = 0; i < correctVariants.length; i++) {
      const variant = correctVariants[i];
      const correctDocRef = doc(this.firestore, `corrects/${quizId}_${i}`);
      await setDoc(correctDocRef, {
        quizId: quizId,
        letter: variant.letter,
        variant: variant.variant
      });
    }
  }
}
