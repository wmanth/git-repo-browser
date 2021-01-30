import { Component } from 'react'
import { RepoInventory, RepoInfo } from '../common/GitRepo'
import DropDown from './DropDown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGitSquare } from '@fortawesome/free-brands-svg-icons'
import './RepoSelector.css'

type RepoSelectionHandler = (id: string) => void

interface RepoSelectorProps {
	onSelect: RepoSelectionHandler
}

interface RepoSelectorState {
	inventory?: RepoInventory
}

interface RepoItemProps {
	repoId: string
	repoInfo: RepoInfo
}
export default class RepoSelector extends Component<RepoSelectorProps, RepoSelectorState> {
	state: RepoSelectorState = {
	}

	handleDropdown = () => {
		fetch('/api/repos')
		.then(response => response.json())
		.then(inventory => this.setState({ inventory: inventory }))
	}

	handleItemClick = (id: string) => {
		console.log('clicked id ', id)
	}

	repoItems = () => {
		const repoItems: React.ReactNode[] = []
		if (this.state.inventory) {
			Object.entries(this.state.inventory).forEach(([id, repo]) =>
				repoItems.push(<this.RepoItem key={ id } repoId={ id } repoInfo={ repo }/>)
			)
		}
		return repoItems
	}

	RepoItem = (props: RepoItemProps) =>
		<div className="repo-item" onClick={ () => this.handleItemClick(props.repoId) }>
			<span className="repo-icon"><FontAwesomeIcon icon={ faGitSquare } size="3x" /></span>
			<span className="repo-desc">
				<div className="repo-name">{ props.repoInfo.name }</div>
				<div className="repo-remote">{ props.repoInfo.remote }</div>
			</span>
		</div>

	Content = () =>
		<div className="repo-select">{ this.repoItems() }</div>

	render() {
		return(
			<DropDown
				title={ <span>RepoSelect</span> }
				content={ <this.Content /> }
				onDropdown={ this.handleDropdown }/>
		)
	}
}
