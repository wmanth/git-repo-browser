import { Component } from 'react'
import './SplitView.css'

interface SplitViewProps {
	initialPrimaryExtend?: number
	sidebar: React.ReactNode
	content: React.ReactNode
}

interface SplitViewState {
	primaryExtend: number
	isSplitbarHovering: boolean
	isSplitbarMoving: boolean
}

export default class SplitView extends Component<SplitViewProps, SplitViewState> {
	state: SplitViewState = {
		primaryExtend: 200,
		isSplitbarHovering: false,
		isSplitbarMoving: false
	}

	componentDidMount() {
		if (this.props.initialPrimaryExtend)
			this.setState({ primaryExtend: this.props.initialPrimaryExtend })
	}

	handleMouseMove = (event: any) => {
		if (this.state.isSplitbarMoving) {
			this.setState({ primaryExtend: event.nativeEvent.clientX})
		}
		else {
			this.setState({ isSplitbarHovering: (Math.abs(event.nativeEvent.clientX - this.state.primaryExtend) < 3) })
		}
	}

	handleMouseDown = () => {
		this.setState({ isSplitbarMoving: this.state.isSplitbarHovering })
	}

	handleMouseUp = () => {
		this.setState({ isSplitbarMoving: false })
	}

	render() {
		return (
			<section className="split-view"
				onMouseMove={ this.handleMouseMove }
				onMouseDown={ this.handleMouseDown }
				onMouseUp={ this.handleMouseUp }
				style={ {cursor: this.state.isSplitbarHovering ? "col-resize" : "auto"} }>
				<div className="primary" style={ {width: `${this.state.primaryExtend}px`} }>
					{ this.props.sidebar }
				</div>
				<div className="secondary">
					{ this.props.content }
				</div>
			</section>
		)
	}

}