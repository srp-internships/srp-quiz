import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, DocumentData, query, where, addDoc, doc, updateDoc, deleteDoc, writeBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Quiz, Variant } from '../../interface/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizzesCollection: CollectionReference<Quiz>;
  private correctsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.quizzesCollection = collection(this.firestore, 'quizzes') as CollectionReference<Quiz>;
    this.correctsCollection = collection(this.firestore, 'corrects');
  }

  getQuizzes(): Observable<Quiz[]> {
    return collectionData(this.quizzesCollection, { idField: 'id' }) as Observable<Quiz[]>;
  }

  getQuizzesByCategory(categoryId: string): Observable<Quiz[]> {
    const quizzesByCategoryQuery = query(this.quizzesCollection, where('categoryId', '==', categoryId));
    return collectionData(quizzesByCategoryQuery, { idField: 'id' }) as Observable<Quiz[]>;
  }

  addQuiz(quizData: Quiz): Promise<any> {
    return addDoc(this.quizzesCollection, quizData).then(async (quizDocRef) => {
      const quizId = quizDocRef.id;
      await this.addCorrects(quizId, quizData.variants.filter((v: Variant) => v.correct));
    });
  }

  updateQuiz(quizData: Quiz): Promise<void> {
    const quizDocRef = doc(this.firestore, `quizzes/${quizData.id}`);
    return updateDoc(quizDocRef, {
      question: quizData.question,
      categoryId: quizData.categoryId,
      multiple: quizData.multiple,
      variants: quizData.variants
    }).then(async () => {
      await this.addCorrects(quizData.id!, quizData.variants.filter((v: Variant) => v.correct));
    });
  }

  deleteQuiz(id: string): Promise<void> {
    const quizDocRef = doc(this.firestore, `quizzes/${id}`);
    return deleteDoc(quizDocRef);
  }

  async addCorrects(quizId: string, correctVariants: Variant[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    correctVariants.forEach(variant => {
      const correctDocRef = doc(this.correctsCollection, `${quizId}-${variant.letter}`);
      batch.set(correctDocRef, variant);
    });
    return batch.commit();
  }

  async isDuplicateQuestion(question: string, excludeId?: string): Promise<boolean> {
    const quizzes = await firstValueFrom(this.getQuizzes());
    if (!quizzes) return false;
    return quizzes.some(quiz => quiz.question === question && quiz.id !== excludeId);
  }
}
