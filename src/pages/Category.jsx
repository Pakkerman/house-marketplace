import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
// API
import fetchListings from '../APIs/fetchListings'
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

function Category() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchListing, setLastFetchListing] = useState(null) // this is not a number but a object that needed to be set into startAfter query param
  const params = useParams()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchListing(lastVisible)

        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({ id: doc.id, data: doc.data() })
        })
        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error('Something went wrong when getting listings')
      }
    }
    fetchListings()
  }, [params.categoryName])

  // Pagination / Load More Listings
  const onFetchMoreListings = async () => {
    try {
      const listingsRef = collection(db, 'listings')
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchListing),
        limit(10)
      )
      const querySnap = await getDocs(q)
      const listings = []
      querySnap.forEach((doc) => {
        return listings.push({ id: doc.id, data: doc.data() })
      })
      setListings((prev) => [...prev, ...listings])
    } catch (error) {
      toast.error('Something went wrong when getting listings')
    }
  }

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === 'rent'
            ? 'Places for rent'
            : 'Places for sale'}
        </p>
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
          <br />
          <br />
          {lastFetchListing && (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category
