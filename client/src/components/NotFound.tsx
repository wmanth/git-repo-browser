	import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDizzy } from '@fortawesome/free-regular-svg-icons'
import './NotFound.scss'

interface NotFoundProps {
	message: string
}

export default function NotFound(props: NotFoundProps) {

	return <div className="full-size">
		<div className="notfound">
			<div className="title">4<FontAwesomeIcon icon={ faDizzy } />4</div>
			<div className="subtitle">{ props.message }</div>
		</div>
	</div>
}
