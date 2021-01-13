import { Component } from 'react'
import DropDown from './DropDown'


export default class RefSelector extends Component {

	content = <div>Ref A</div>

	render() {
		return (
			<DropDown title="RefSelector" content={ this.content } />
		)
	}
}
