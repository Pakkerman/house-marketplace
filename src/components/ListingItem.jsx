import { Link } from 'react-router-dom'

import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'

import { formatPrice } from '../helpers/helpers'

function ListingItem({ listing, id, onDelete }) {
  const {
    bathrooms,
    bedrooms,
    discountedPrice,
    furnished,
    geolocations,
    imgUrls,
    location,
    name,
    offer,
    parking,
    regularPrice,
    timestamp,
    type,
    userRef,
  } = listing

  console.log(listing)

  return (
    <li className="categoryListing">
      <Link to={`/category/${type}/${id}`} className="categoryListingLink">
        <img src={imgUrls[0]} alt={name} className="categoryListingImg" />
        <div className="categoryListingDetalis">
          <p className="categoryListingLocation">{location}</p>
          <p className="categoryListingName">{name}</p>
          <p className="categoryListingPrice">
            {offer ? formatPrice(discountedPrice) : formatPrice(regularPrice)}
            {type === 'rent' && ' / Month'}
          </p>
          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {bedrooms > 1 ? `${bedrooms} Bedroom` : `${bedrooms} Bedrooms`}
            </p>
            <img src={bathtubIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {bathrooms > 1
                ? `${bathrooms} Bathroom`
                : `${bathrooms} Bathrooms`}
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231, 76, 60)"
          onClinck={() => onDelete(id, name)}
        />
      )}
    </li>
  )
}

export default ListingItem
