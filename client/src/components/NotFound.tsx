import { Fragment } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDizzy } from '@fortawesome/free-regular-svg-icons'
import './NotFound.css'

export default function NotFound() {

	return <Fragment>
		<div className="full-size"><span className="message">4<FontAwesomeIcon icon={ faDizzy } />4</span></div>
	</Fragment>
}
