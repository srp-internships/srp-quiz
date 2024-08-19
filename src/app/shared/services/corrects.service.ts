import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { QuizCorrect } from '../../interface/quiz.interface';

@Injectable({ providedIn: 'root' })
export class CorrectsService {
  firestore = inject(Firestore);
  correctsCollection = collection(this.firestore, 'corrects');

  async addCorrects(quizId: string, correct: QuizCorrect) {
    console.log('Adding corrects:', { quizId, correct });
    const docRef = doc(this.correctsCollection, quizId);
    const correctsWithId: QuizCorrect = { ...correct, quizId };
    return setDoc(docRef, correctsWithId, { merge: true });
  }

  async getCorrects(quizId: string): Promise<QuizCorrect | null> {
    try {
      const docRef = doc(this.firestore, 'corrects', quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as QuizCorrect;
      } else {
        return null;
      }
    } catch (error) {
      console.error('error', error);
      return null;
    }
  }
}
