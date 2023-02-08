import axios from 'axios'

const API_KEY = process.env.REACT_APP_X_RAPIDAPI_KEY
const HOST_KEY = process.env.REACT_APP_X_RAPIDAPI_HOST

export async function addressToGeocode(address) {
  try {
    const options = {
      method: 'GET',
      url: 'https://trueway-geocoding.p.rapidapi.com/Geocode',
      params: {
        address,
        language: 'en',
      },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': HOST_KEY,
      },
    }
    const response = await axios.request(options)
    const {
      location: { lng, lat },
    } = response.data.results[0]

    if (response.data.results.lenght === 0) {
      return undefined
    }

    return { lng, lat }
  } catch (error) {
    return error
  }
}
