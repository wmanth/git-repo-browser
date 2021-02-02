import { Fragment } from "react";
import './Popover.css'

interface PopoverProps {
	anchor?: HTMLElement
	onClose?: () => void
	children: JSX.Element
}

export default function Popover(props: PopoverProps) {
	const position = () => {
		return ({
			top: props.anchor?.getBoundingClientRect().bottom,
			left: props.anchor?.getBoundingClientRect().left
		})
	}

	const handleClick = () => {
		if (props.onClose) props.onClose()
	}

	return props.anchor ?
		<Fragment>
			<div className="popover" style={ position() }>{ props.children }</div>
			<div className="popover-layer" onClick={ handleClick }/>
		</Fragment> :
		<Fragment />
}
