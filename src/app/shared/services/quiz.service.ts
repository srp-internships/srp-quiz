import { Injectable } from '@angular/core';
import {
  Firestore,
  collectionData,
  getDocs,
  collection,
  setDoc,
  CollectionReference,
  DocumentData,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Quiz, Variant, QuizCorrect } from '../../interface/quiz.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private quizzesCollection: CollectionReference<Quiz>;

  constructor(private firestore: Firestore) {
    this.quizzesCollection = collection(
      this.firestore,
      'quizzes'
    ) as CollectionReference<Quiz>;
  }

  getQuizzes(): Observable<Quiz[]> {
    return collectionData(this.quizzesCollection, {
      idField: 'id',
    }) as Observable<Quiz[]>;
  }

  getQuizzesByCategory(categoryId: string): Observable<Quiz[]> {
    const quizzesByCategoryQuery = query(
      this.quizzesCollection,
      where('categoryId', '==', categoryId)
    );
    return collectionData(quizzesByCategoryQuery, {
      idField: 'id',
    }) as Observable<Quiz[]>;
  }

  async addQuiz(quizData: Quiz): Promise<string> {
    try {
      console.log('add:', quizData);
      const quizDocRef = await addDoc(this.quizzesCollection, quizData);
      const quizId = quizDocRef.id;
      console.log('quizId:', quizId);
      return quizId;
    } catch (error) {
      console.error('err:', error);
      throw error;
    }
  }

  updateQuiz(quizData: Quiz): Promise<void> {
    const quizDocRef = doc(this.firestore, `quizzes/${quizData.id}`);
    return updateDoc(quizDocRef, {
      question: quizData.question,
      categoryId: quizData.categoryId,
      multiple: quizData.multiple,
      variants: quizData.variants,
    });
  }

  deleteQuiz(id: string): Promise<void> {
    const quizDocRef = doc(this.firestore, `quizzes/${id}`);
    return deleteDoc(quizDocRef);
  }

  async isDuplicateQuestion(
    question: string,
    excludeId?: string
  ): Promise<boolean> {
    const quizzes = await firstValueFrom(this.getQuizzes());
    if (!quizzes) return false;
    return quizzes.some(
      (quiz) => quiz.question === question && quiz.id !== excludeId
    );
  }
}
