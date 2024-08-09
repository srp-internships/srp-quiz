import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { QuizCorrect } from '../../interface/quiz.interface';

@Injectable({ providedIn: 'root' })
export class CorrectsService {
  firestore = inject(Firestore);
  correctsCollection = collection(this.firestore, 'corrects');

  addCorrects(quizId: string, correct: QuizCorrect) {
    const docRef = doc(this.correctsCollection, quizId);
    return setDoc(docRef, correct);
  }

  async getCorrectAnswers(quizId: string): Promise<QuizCorrect[]> {
    const correctsQuery = query(
      this.correctsCollection,
      where('quizId', '==', quizId)
    );
    const correctsSnapshot = await getDocs(correctsQuery);
    return correctsSnapshot.docs.map((doc) => doc.data() as QuizCorrect);
  }
}
