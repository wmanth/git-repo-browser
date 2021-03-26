import Editor from '@monaco-editor/react'
import FolderView from '../components/FolderView'
import { useEffect, useState } from 'react'
import { GitTreeNode } from '../common/GitTree'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompass } from '@fortawesome/free-regular-svg-icons'
import './ContentView.css'


interface ContentViewProps {
	node?: GitTreeNode
}

export default function ContentView(props: ContentViewProps) {
	const [content, setContent] = useState("")

	useEffect(() => {
		if (props.node?.isFile()) {
			props.node.tree.fetchPath(props.node.path)
			.then(response => response.text())
			.then(content => setContent(content))
		}
	}, [props.node])

	const options = { readOnly: true }

	return props.node?.isFile() ?
		<Editor
			language = "javascript"
			value = { content }
			options = { options } /> :
		props.node?.isDirectory() ?
		<FolderView node={ props.node }/> :
		<div className="full-size"><span className="empty"><FontAwesomeIcon icon={ faCompass } size="10x" /></span></div>
}
