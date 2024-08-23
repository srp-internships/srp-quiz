import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private firestore: Firestore) { }

  getCategories(): Observable<any[]> {
    const categoriesCollection = collection(this.firestore, 'categories');
    const queryCategories = query(categoriesCollection, where('deleted', '==', false));
    return collectionData(queryCategories, { idField: 'id' });
  }

  getQuestionsByCategory(categoryId: string): Observable<any[]> {
    const questionsCollection = collection(this.firestore, 'questions');
    const queryQuestions = query(questionsCollection, where('categoryId', '==', categoryId));
    return collectionData(queryQuestions, { idField: 'id' });
  }

  addCategory(name: string): Promise<any> {
    const categoriesCollection = collection(this.firestore, 'categories');
    return addDoc(categoriesCollection, { name, deleted: false });
  }

  updateCategory(id: string, name: string): Promise<void> {
    const categoryDoc = doc(this.firestore, `categories/${id}`);
    return updateDoc(categoryDoc, { name });
  }

  deleteCategory(id: string): Promise<void> {
    const categoryDoc = doc(this.firestore, `categories/${id}`);
    return updateDoc(categoryDoc, { deleted: true });
  }

  async checkDuplicateCategory(name: string, excludeId?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getCategories().subscribe({
        next: categories => {
          const isDuplicate = categories.some(category => category.name === name && category.id !== excludeId);
          resolve(isDuplicate);
        },
        error: error => {
          reject(error);
        }
      });
    });
  }
}
