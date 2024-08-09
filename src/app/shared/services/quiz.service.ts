import { Injectable } from '@angular/core';
import { Firestore, collectionData, getDocs , collection, setDoc, CollectionReference, DocumentData, query, where, addDoc, doc, updateDoc, deleteDoc, writeBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Quiz, Variant, CorrectAnswer } from '../../interface/quiz.interface';

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

  async addQuiz(quizData: Quiz): Promise<string> {
    try {
      console.log('add:', quizData);
      const quizDocRef = await addDoc(this.quizzesCollection, {
        question: quizData.question,
        categoryId: quizData.categoryId,
        multiple: quizData.multiple,
        variants: quizData.variants.map(({ letter, variant }) => ({ letter, variant })) 
      });
      const quizId = quizDocRef.id;
      console.log('quizId:', quizId);

      await this.addCorrects(quizId, quizData.variants.filter((v: Variant) => v.correct));
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
    console.log('quizId:', quizId);
  
    correctVariants.forEach((variant) => {
      const correctDocRef = doc(this.correctsCollection, quizId);
      batch.set(correctDocRef, {
        letter: variant.letter,
        variant: variant.variant,
        correct: variant.correct
      }, { merge: true });
    });
  
    try {
      await batch.commit();
    } catch (error) {
      console.error('err:', error);
    }
  }

  async getCorrectAnswers(quizId: string): Promise<CorrectAnswer[]> {
    const correctsQuery = query(this.correctsCollection, where('quizId', '==', quizId));
    const correctsSnapshot = await getDocs(correctsQuery);
    return correctsSnapshot.docs.map(doc => doc.data() as CorrectAnswer);
  }

  async isDuplicateQuestion(question: string, excludeId?: string): Promise<boolean> {
    const quizzes = await firstValueFrom(this.getQuizzes());
    if (!quizzes) return false;
    return quizzes.some(quiz => quiz.question === question && quiz.id !== excludeId);
  }
}
