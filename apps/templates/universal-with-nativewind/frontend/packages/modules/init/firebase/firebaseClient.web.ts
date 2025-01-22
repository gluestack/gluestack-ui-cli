import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import config from '@app-launch-kit/config';

const firebaseConfig = {
  apiKey: config.env.firebase.API_KEY,
  authDomain: config.env.firebase.AUTH_DOMAIN,
  projectId: config.env.firebase.PROJECT_ID,
  storageBucket: config.env.firebase.STORAGE_BUCKET,
  messagingSenderId: config.env.firebase.MESSAGING_SENDER_ID,
  appId: config.env.firebase.APP_ID,
};

// const firebaseConfig = {
//   apiKey: 'AIzaSyCg8OnE1F3Vmh3Yz53EB_JKZwqQMu2-IQE',
//   authDomain: 'kyubtau-13962.firebaseapp.com',
//   projectId: 'kyubtau-13962',
//   storageBucket: 'kyubtau-13962.appspot.com',
//   messagingSenderId: '187773939947',
//   appId: '1:187773939947:web:5462c2a139783e7ba00eae',
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { auth, storage, db };
