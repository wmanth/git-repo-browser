import { Fragment, MouseEvent, useState, useEffect } from 'react'
import { GitRef } from '../common/GitRepo'
import { GitTree } from '../common/GitTree'
import { GoGitBranch, GoTag } from 'react-icons/go'
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
		props.gitTree?.repo.fetchTags().then(tags => setTags(tags))
		props.gitTree?.repo.fetchBranches().then(branches => setBranches(branches))
	}, [props.gitTree])

	const handleRefSelect = (ref: GitRef) => {
		setPopoverAnchor(null)
		if (props.onSelect ) props.onSelect(ref)
	}

	const refItemClassName = (ref: GitRef) => {
		return props.gitTree?.ref.refName === ref.refName ?
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
		const icon =
			props.gitTree.ref.isTag() ? <GoTag className="ref-icon" /> :
			props.gitTree.ref.isBranch() ? <GoGitBranch  className="ref-icon" /> :
			<Fragment />
		return <Fragment>{ icon } { props.gitTree.ref.name }</Fragment>
	}

	const Content = () => <div className="ref-select">
		<nav>
			<div
				className={ refTypeSelection === SelectionType.Branches ? "nav-item selected" : "nav-item" }
				onClick={ handleSelectBranches }>
					<span className="inline-center"><GoGitBranch className="ref-icon" />Branches</span>
			</div>
			<div
				className={ refTypeSelection === SelectionType.Tags ? "nav-item selected" : "nav-item" }
				onClick={ handleSelectTags }>
					<span className="inline-center"><GoTag className="ref-icon" />Tags</span>
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
