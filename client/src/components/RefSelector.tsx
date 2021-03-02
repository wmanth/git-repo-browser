import { Fragment, MouseEvent, useState, useEffect } from 'react'
import { GitRef } from '../common/GitRepo'
import { GitTree } from '../common/GitTree'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTag, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import Popover from './Popover'
import './RefSelector.css'

interface RefSelectorProps {
	gitTree?: GitTree
	onSelect?: (ref: GitRef) => void
}

enum SelectionType {
	Branches, Tags
}

export default function RefSelector(props: RefSelectorProps) {
	const [tags, setTags] = useState<GitRef[]>([])
	const [branches, setBranches] = useState<GitRef[]>([])
	const [refTypeSelection, setRefTypeSelection] = useState(SelectionType.Branches)
	const [popoverAnchor, setPopoverAnchor] = useState<any>(null)

	useEffect(() => {
		props.gitTree?.getRepo().fetchTags().then(tags => setTags(tags))
		props.gitTree?.getRepo().fetchBranches().then(branches => setBranches(branches))
	}, [props.gitTree])

	const handleRefSelect = (ref: GitRef) => {
		setPopoverAnchor(null)
		if (props.onSelect ) props.onSelect(ref)
	}

	const refItemClassName = (ref: GitRef) => {
		return props.gitTree?.getRef().refName === ref.refName ?
			"ref-item selected" : "ref-item"
	}

	const refList = () => {
		let refs
		switch (refTypeSelection) {
			case SelectionType.Tags: refs = tags; break
			case SelectionType.Branches: refs = branches; break
		}
		return refs.map(ref => <li
			key={ ref.name }
			className={ refItemClassName(ref) }
			onClick={ () => handleRefSelect(ref) }>
				{ ref.name }
			</li>)
	}

	const handleSelectTags = () => setRefTypeSelection(SelectionType.Tags)
	const handleSelectBranches = () => setRefTypeSelection(SelectionType.Branches)

	const Title = () => {
		if (!props.gitTree) return <span>select</span>
		const ref = props.gitTree.getRef()
		const icon =
			ref.isTag() ?
				<FontAwesomeIcon icon={ faTag } color="dimgray" size="sm" /> :
			ref.isBranch() ?
				<FontAwesomeIcon icon={ faCodeBranch } color="dimgray" size="sm" /> :
			<Fragment />
		return <span>{ icon } { props.gitTree.getRef().name }</span>
	}

	const Content = () => <div className="ref-select">
		<nav>
			<div
				className={ refTypeSelection === SelectionType.Branches ? "nav-item selected" : "nav-item" }
				onClick={ handleSelectBranches }>
					<span><FontAwesomeIcon icon={ faCodeBranch } color="dimgray" size="sm" /> Branches</span>
			</div>
			<div
				className={ refTypeSelection === SelectionType.Tags ? "nav-item selected" : "nav-item" }
				onClick={ handleSelectTags }>
					<span><FontAwesomeIcon icon={ faTag } color="dimgray" size="sm" /> Tags</span>
			</div>
		</nav>
		<ul className="ref-list" >
			{ refList() }
		</ul>
	</div>

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
