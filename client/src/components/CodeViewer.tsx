import Editor from "@monaco-editor/react"

interface CodeViewerProps {
	content?: string
}

export default function CodeViewer(props: CodeViewerProps) {
	const options = { readOnly: true }
	return(
		<Editor
			language = "javascript"
			value = { props.content }
			options = { options }
		/>
	)
}
