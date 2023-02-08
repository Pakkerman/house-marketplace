import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'

function Contact() {
  const [message, setMessage] = useState('')
  const [landlord, setLandlord] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useParams()

  useEffect(() => {
    getLandlord()

    async function getLandlord() {
      const docRef = doc(db, 'users', params.landlordId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) toast.error('Can Not Contact Landlord')
      setLandlord(docSnap.data())
    }
  }, [params.landlordId])

  const onChange = (event) => setMessage(event.target.value)

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contanctLandlord">
            <p className="landlordName">Contact {landlord?.name}</p>
            <form className="messageForm">
              <div className="messageDiv">
                <label htmlFor="message" className="messageLabel">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  className="textarea"
                  value={message}
                  onChange={onChange}
                  placeholder=""
                ></textarea>
              </div>
              <a
                href={mailto(
                  landlord.mail,
                  searchParams.get('listingName'),
                  message
                )}
              >
                <button type="button" className="primaryButton">
                  Send Message
                </button>
              </a>
            </form>
          </div>
        </main>
      )}
    </div>
  )
}

function mailto(email, listingName, message) {
  return `mailto:${email}?Subject=${listingName}&body=${message}`
}

export default Contact
