import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.config'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import Spinner from './Spinner'
import { formatPrice } from '../helpers/helpers'

function Slider() {
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
      const querySnap = await getDocs(q)

      let listings = []
      querySnap.forEach((item) => {
        return listings.push({
          id: item.id,
          data: item.data(),
        })
      })

      setListings(listings)
      setLoading(false)
    }

    fetchListings()
  }, [])

  if (loading) <Spinner />

  if (listings?.length === 0) {
    return <></>
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Latest Listings</p>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={1}
          pagination={{ clickable: true }}
        >
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                className="swiperSlideDiv"
                style={{
                  width: '100%',
                  height: '30vh',
                  background: `url(${data.imgUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  {`${formatPrice(data.discountedPrice ?? data.regulatPrice)} ${
                    data.type === 'rent' ? ' / month' : ''
                  }`}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default Slider
