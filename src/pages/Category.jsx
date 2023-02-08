import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
// API
import fetchListings from '../APIs/fetchListings'

function Category() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    fetchListings(params).then((data) => setListings(data))
    setLoading(false)
  }, [params.categoryName])

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
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category
