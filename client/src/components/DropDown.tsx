import { Fragment, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import './DropDown.css'

export type DropDownHandler = () => void
interface DropDownProps {
	title: JSX.Element
	content: React.ReactNode
	onDropdown?: DropDownHandler
}

export default function DropDown(props: DropDownProps) {
	const [droppedDown, setDroppedDown] = useState(false)

	const handleClick = () => {
		setDroppedDown(!droppedDown)
	}

	const DropDownLayer = () => droppedDown ? <Fragment>
		<div className="dropdown-content">{ props.content }</div>
		<div className="dropdown-layer" onClick={ handleClick }/></Fragment> :
		<Fragment />

	return (
		<span className="dropdown">
			<div className="button" onClick={ handleClick }>{ props.title } <FontAwesomeIcon icon={ faCaretDown } /></div>
			<DropDownLayer />
		</span>
	)
}
