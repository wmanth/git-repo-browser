import { Fragment, MouseEvent } from "react";
import './Popover.css'

interface PopoverProps {
	anchor?: HTMLElement
	onClose?: (event: MouseEvent<HTMLElement>) => void
	children: JSX.Element
}

export default function Popover(props: PopoverProps) {
	const position = () => {
		return ({
			top: props.anchor?.getBoundingClientRect().bottom,
			left: props.anchor?.getBoundingClientRect().left
		})
	}

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		if (props.onClose) props.onClose(event)
	}

	return props.anchor ?
		<Fragment>
			<div className="popover" style={ position() }>{ props.children }</div>
			<div className="popover-layer" onClick={ handleClick }/>
		</Fragment> :
		<Fragment />
}
