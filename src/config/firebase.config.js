import {getApp, getApps, initializeApp} from "firebase/app"

import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBQGAm6USWCb_Oh_dl5ejq8xZp2yTUo8J4",
  authDomain: "resumebuilder-83f4f.firebaseapp.com",
  projectId: "resumebuilder-83f4f",
  storageBucket: "resumebuilder-83f4f.appspot.com",
  messagingSenderId: "114855240920",
  appId: "1:114855240920:web:2d5d8dbd33ddd2f18163ad"
  };

//   if here length is greater than 0 than it means it already initialized...
  const app = getApps.length > 0 ? getApp() : initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  export {auth, db};