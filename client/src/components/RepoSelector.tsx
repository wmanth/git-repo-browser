import { Fragment, MouseEvent, useState } from 'react'
import GitRepo, { RepoInventory, RepoInfo } from '../common/GitRepo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGitSquare } from '@fortawesome/free-brands-svg-icons'
import { GitTree } from '../common/GitTree'
import Popover from './Popover'
import './RepoSelector.css'

type RepoSelectionHandler = (repo: GitRepo) => void

interface RepoSelectorProps {
	gitTree?: GitTree
	onSelect?: RepoSelectionHandler
}

interface RepoItemProps {
	repoId: string
	repoInfo: RepoInfo
}
export default function RepoSelector(props: RepoSelectorProps) {
	const [popoverAnchor, setPopoverAnchor] = useState<any>(null)

	const fetchInventory = () => {
		fetch('/api/repos')
		.then(response => response.json())
		.then(inventory => setInventory(inventory))
	}

	const [inventory, setInventory] = useState<RepoInventory | undefined>(() => {
		fetchInventory()
		return undefined
	})

	const Title = () =>
		<span>{ props.gitTree && inventory ?
			inventory[props.gitTree.getRepo().getId()].name : "select" }
		</span>

	const handleItemClick = (id: string) => {
		if (props.onSelect && inventory) props.onSelect(new GitRepo(id, inventory[id]))
		handleClose()
	}

	const repoItems = () => {
		const repoItems: JSX.Element[] = []
		if (inventory) {
			Object.entries(inventory).forEach(([id, repo]) =>
				repoItems.push(<RepoItem key={ id } repoId={ id } repoInfo={ repo }/>)
			)
		}
		return repoItems
	}

	const RepoItem = (itemProps: RepoItemProps) => {
		const className = props.gitTree?.getRepo().getId() === itemProps.repoId ?
			"repo-item selected" : "repo-item"
		return <li className={ className } onClick={ () => handleItemClick(itemProps.repoId) }>
			<span className="repo-icon"><FontAwesomeIcon icon={ faGitSquare } size="3x" /></span>
			<span className="repo-desc">
				<div className="repo-name">{ itemProps.repoInfo.name }</div>
				<div className="repo-remote">{ itemProps.repoInfo.remote }</div>
			</span>
		</li>
	}

	const Content = () =>
		<ul className="repo-list">{ repoItems() }</ul>

	const handleOpen = (event: MouseEvent<HTMLElement>) =>
		setPopoverAnchor(event.currentTarget)

	const handleClose = () =>
		setPopoverAnchor(null)

	return <Fragment>
		<div className="dropdown-btn" onClick={ handleOpen }><Title /></div>
		<Popover anchor={ popoverAnchor } onClose={ handleClose }>
			<Content />
		</Popover>
	</Fragment>
}
