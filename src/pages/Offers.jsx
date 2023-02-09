import { useEffect, useState } from 'react'

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
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchedListings, setLastFetchedListings] = useState('123')
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get Firestore reference
        const listingsRef = collection(db, 'listings')
        // create a query
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(2)
        )
        // execute query
        const querySnap = await getDocs(q)

        setLastFetchedListings(querySnap.docs[querySnap.docs.length - 1])

        const listings = []

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error('Something went wrong when getting listings')
      }
    }

    fetchListings()
  }, [])

  const onFetchMore = async () => {
    const q = query(
      collection(db, 'listings'),
      where('offer', '==', true),
      orderBy('timestamp', 'desc'),
      startAfter(lastFetchedListings),
      limit(10)
    )
    const documentSnapshot = await getDocs(q)
    let listings = []
    documentSnapshot.forEach((doc) => {
      return listings.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    setListings((prev) => [...prev, ...listings])
  }

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>
          {lastFetchedListings && (
            <p className="loadMore" onClick={onFetchMore}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no offers currently</p>
      )}
    </div>
  )
}

export default Offers
