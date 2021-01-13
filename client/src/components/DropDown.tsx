import { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import './DropDown.css'

export type DropDownHandler = () => void
interface DropDownProps {
	title: string
	content: React.ReactNode
	onDropdown?: DropDownHandler
}

interface DropDownState {
	droppedDown: boolean
}

export default class DropDown extends Component<DropDownProps, DropDownState> {
	state: DropDownState = {
		droppedDown: false
	}

	handleClick = () => {
		this.setState({ droppedDown: !(this.state.droppedDown) })
		this.props.onDropdown && this.props.onDropdown()
	}

	render() {
		return (
			<span className="dropdown">
				<button onClick={ this.handleClick }>{ this.props.title } <FontAwesomeIcon icon={ faCaretDown } /></button>
				<div
					className="dropdown-content"
					style={ {display : this.state.droppedDown ? "block" : "none"} }>
					{ this.props.content }
				</div>
			</span>
		)
	}
}