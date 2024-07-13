import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  User,
} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User | null = null;
  authState$ = authState(this.auth);

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => {
      this.user = this.auth.currentUser;
    });
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  getUser(): User | null {
    return this.user;
  }

  isLoggedIn(): boolean {
    return this.user !== null;
  }

  async profile(): Promise<User | null> {
    this.user = await firstValueFrom(this.authState$);
    return this.user;
  }
  
}
