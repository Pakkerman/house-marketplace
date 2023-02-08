import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'

const fetchListings = async (params) => {
  try {
    // get Firestore reference
    const listingsRef = collection(db, 'listings')
    // create a query
    const q = query(
      listingsRef,
      where('type', '==', params.categoryName),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    // execute query
    const querySnap = await getDocs(q)

    const listings = []

    querySnap.forEach((doc) => {
      return listings.push({
        id: doc.id,
        data: doc.data(),
      })
    })
    return listings
  } catch (error) {
    toast.error('Something went wrong when getting listings')
  }
}

export default fetchListings
