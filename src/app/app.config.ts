import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'srp-quiz',
        appId: '1:623714979122:web:985bd02fed586554541b2b',
        storageBucket: 'srp-quiz.appspot.com',
        apiKey: 'AIzaSyAemyRjxpQoI0qL6YrWkdc_JQnUdOoygxQ',
        authDomain: 'srp-quiz.firebaseapp.com',
        messagingSenderId: '623714979122',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()), 
    provideAnimationsAsync(),
  ],

};
