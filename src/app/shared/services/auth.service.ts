import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User | null = null;

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  isLoggedIn(): boolean {
    return this.user !== null || localStorage.getItem('authToken') !== null;
  }

  login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password).then((userSave) => {
      this.user = userSave.user;
      return userSave.user.getIdToken().then((token) => {
        localStorage.setItem('authToken', token);
      });
    });
  }

  logout(): Promise<any> {
    localStorage.removeItem('authToken');
    this.user = null;
    return this.auth.signOut();
  }

  getUser(): User | null {
    return this.user;
  }

  getIdToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
