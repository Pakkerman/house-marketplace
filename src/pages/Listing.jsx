// react
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
// leaflet, map view
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
// swiper, photo slider
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
// google
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
// assets
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
// helpers
import { formatPrice } from '../helpers/helpers'

function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth()

  useEffect(() => {
    fetchListing()

    async function fetchListing() {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        console.log(docSnap.data())
        setListing(docSnap.data())
        setLoading(false)
      }
    }
    return () => {}
  }, [navigate, params.listingId])

  if (loading) {
    return <Spinner />
  }

  return (
    <main>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        slidesPerView={1}
        pagination={{ clickable: true }}
      >
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="swiperSlideDiv"
              style={{
                width: '100%',
                height: '33vh',
                background: `url(${url})
                center no-repeat`,
                backgroundSize: 'cover',
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          setShareLinkCopied(true)
          setTimeout(() => {
            setShareLinkCopied(false)
          }, 2000)
        }}
      >
        <img src={shareIcon} alt="share icon" />
      </div>
      {shareLinkCopied && <p className="linkCopied">Copied!</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing.name} -{' '}
          {listing.offer
            ? formatPrice(listing.discountedPrice)
            : formatPrice(listing.regularPrice)}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : '1 Bathroom'}
          </li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>
        {/* TODO MAP */}

        <div className="leafletContainer">
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  )
}
export default Listing
