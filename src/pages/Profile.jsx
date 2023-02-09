import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import CreateListing from './CreateListing'
import ListingItem from '../components/ListingItem'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

function Profile() {
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListing = async () => {
      const listingRef = collection(db, 'listings')
      const q = query(
        listingRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      )
      const querySanp = await getDocs(q)
      const listings = []

      querySanp.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })
      setListings(listings)
      setLoading(false)
    }

    fetchUserListing()
  }, [auth.currentUser.uid])

  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const onChange = ({ target }) => {
    setFormData((prev) => ({
      ...prev,
      [target.id]: target.value,
    }))
  }

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        // Update displayname in firebase
        await updateProfile(auth.currentUser, { displayName: name })

        // updateFireBase
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, { name })
      }
    } catch (error) {
      toast.error('Could Not Update Profile')
    }
  }

  const onDelete = async (listingId) => {
    console.log('called')
    if (!window.confirm('Confirm Delete Listing?')) return
    await deleteDoc(doc(db, 'listings', listingId))
    const updatedListings = listings.filter(
      (listing) => listing.id !== listingId
    )
    setListings(updatedListings)
    toast.success('Listing Delete Sucessfully!')
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className="logOut" onClick={onLogout}>
          Log Out
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit()
              setChangeDetails((prev) => !prev)
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="email"
              id="email"
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
