import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'
import { formatPrice } from '../helpers/helpers'

function ListingItem({ listing, id, onDelete, onEdit }) {
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

  return (
    <li className="categoryListing">
      <Link to={`/category/${type}/${id}`} className="categoryListingLink">
        <img src={imgUrls[0]} alt={name} className="categoryListingImg" />
        <div className="categoryListingDetails">
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
          onClick={() => onDelete(id, name)}
        />
      )}
      {onEdit && <EditIcon className="editIcon" onClick={() => onEdit(id)} />}
    </li>
  )
}

export default ListingItem
