// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCyA_aXRPR-ncQV4U5YtVx7IdsGGJPY9GU',
  authDomain: 'house-marketplace-reactapp.firebaseapp.com',
  projectId: 'house-marketplace-reactapp',
  storageBucket: 'house-marketplace-reactapp.appspot.com',
  messagingSenderId: '654310098175',
  appId: '1:654310098175:web:50bfae56c961ec3f2778ca',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore()
