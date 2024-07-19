import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, where, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Quiz } from '../../interface/quiz.interface';

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

  getCategories(): Observable<any[]> {
    const categoriesCollection = collection(this.firestore, 'categories');
    const queryCategories = query(categoriesCollection, where('deleted', '==', false));
    return collectionData(queryCategories, { idField: 'id' });
  }

  getQuizzesByCategory(categoryId: string): Observable<Quiz[]> {
    const quizzesByCategoryQuery = query(this.quizzesCollection, where('categoryId', '==', categoryId));
    return collectionData(quizzesByCategoryQuery, { idField: 'id' }) as Observable<Quiz[]>;
  }

  addQuiz(quizData: any): Promise<any> {
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
}
