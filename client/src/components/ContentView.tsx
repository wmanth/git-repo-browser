import Editor from "@monaco-editor/react"
import { useEffect, useState } from "react"
import { GitTreeNode } from "../common/GitTree"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCompass } from '@fortawesome/free-regular-svg-icons'


interface ContentViewProps {
	node?: GitTreeNode
}

export default function ContentView(props: ContentViewProps) {
	const [content, setContent] = useState("")

	useEffect(() => {
		if (props.node?.isFile()) {
			props.node.getTree().fetchPath(props.node.getPath())
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
		<div><FontAwesomeIcon icon={ faCompass } color="lightgray" size="10x" /></div>
}
