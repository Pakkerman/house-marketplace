import { useEffect, useRef, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const isMounted = useRef(true)

  // If the component is unmounted before the auth is complete,
  // useEffect() will fire off the return function, and change isMounted to false
  // and in this way
  useEffect(() => {
    if (isMounted) {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true)
        }
        setCheckingStatus(false)
      })
    }
    return () => (isMounted.current = false)
  }, [isMounted])

  return { loggedIn, checkingStatus }
}

export default useAuthStatus
