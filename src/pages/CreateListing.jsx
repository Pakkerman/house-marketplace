import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import axios from 'axios'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { v4 as uuidv4 } from 'uuid'

import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

function CreateListing() {
  const API_KEY = process.env.REACT_APP_X_RAPIDAPI_KEY
  const HOST_KEY = process.env.REACT_APP_X_RAPIDAPI_HOST

  const [geolocationEnabled, setGeolocationEnable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: 'TESTING NAME',
    type: 'sale',
    bedrooms: 1,
    bathrooms: 1,
    parking: true,
    furnished: false,
    address: '"TESTING" 517 High Ridge St Flowery Branch, GA 30542',
    offer: true,
    regularPrice: 6500000,
    discountedPrice: 6200000,
    images: {},
    latitude: 0,
    longitude: 0,
  })

  // DESTRUCT DATA
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef()

  useEffect(() => {
    if (!isMounted) return () => (isMounted.current = false)

    onAuthStateChanged(auth, (user) => {
      if (!user) return navigate('/sign-in')
      setFormData({ ...formData, userRef: user.uid })
    })
  }, [isMounted])

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    // CHECK PRICE
    if (discountedPrice > regularPrice) {
      setLoading(false)
      toast.error('Discounted Price Needs to be Lower Than Regular Price!')
      return
    }
    // CHECK IMAGE QUANITY
    if (images.length > 6) {
      setLoading(false)
      toast.error('Can Not Upload More Than 6 Images')
      return
    }

    let geolocation = {}

    // If enable manual Geolocation input
    if (!geolocationEnabled) {
      geolocation.lat = latitude
      geolocation.lng = longitude
    }

    // FETCH GEOCODING FROM API
    if (geolocationEnabled) {
      try {
        const options = {
          method: 'GET',
          url: 'https://trueway-geocoding.p.rapidapi.com/Geocode',
          params: {
            address: address,
            language: 'en',
          },
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': HOST_KEY,
          },
        }
        const response = await axios.request(options)
        const {
          address: APIResponseAddress,
          location: { lng, lat },
        } = response.data.results[0]

        geolocation.lat = lat ?? 0
        geolocation.lng = lng ?? 0

        // Undefined Address or wrong address
        if (response.data.results.lenght === 0) {
          setLoading(false)
          return toast.error('Please Enter the Correct Address')
        }
      } catch (error) {
        console.log(error)
        toast.error('Can Not Get Location Data')
        return
      }
    }

    // Upload Images to firebase
    const storeImage = async (image) => {
      // storeImage returns a promise which upload one image at a time
      return new Promise((resolve, reject) => {
        // from google firestore
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
        const storageRef = ref(storage, 'images/' + fileName)
        const uploadTask = uploadBytesResumable(storageRef, image)
        // Start upload task, and tracking prograss
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const prograss =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + prograss + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running ')
                break
            }
          },
          (error) => {
            reject(error)
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Image upload failed')
      return
    })

    // Update Form Data to Database
    const formDataCopy = {
      ...formData,
      geolocation,
      imgUrls,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    // location && (formDataCopy.location = location)
    !formDataCopy.offer && delete formDataCopy.discountedPrice
    console.log(formDataCopy)

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)

    setLoading(false)
    toast.success('Listing Created!')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  // FORM STATE CHANGE
  const onMutate = (event) => {
    if (!offer) setFormData({ ...formData, discountedPrice: 0 })

    let boolean = null
    if (event.target.value === 'true') boolean = true
    if (event.target.value === 'false') boolean = false

    // Files
    if (event.target.files) {
      setFormData((prev) => {
        return { ...prev, images: event.target.files }
      })
    }

    // Text/Bools/Numbers
    if (!event.target.files) {
      setFormData((prev) => {
        return { ...prev, [event.target.id]: boolean ?? event.target.value }
      })
    }
  }

  // SET LOADING
  if (loading) {
    return <Spinner />
  }

  // JSX
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">
            Name
            <input
              type="text"
              className="formInputName"
              id="name"
              value={name}
              onChange={onMutate}
              maxLength="32"
              minLength="10"
              required
            />
          </label>
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking Spot</label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            type="text"
            className="formInputAddress"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          {/* OFFER */}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              type="button"
              className={offer ? 'formButtonActive' : 'formButton'}
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* REGULAR PRICE FIELD */}
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              type="number"
              className="formInputSmall"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="0"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                type="number"
                className="formInputSmall"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            className="formInputFile"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button className="primaryButton createListingButton" type="submit">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
