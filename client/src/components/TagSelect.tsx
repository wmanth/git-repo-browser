import React from "react";
import { Select } from "antd";
import "./TagSelect.css"

const { Option } = Select;

interface TagsProps {
  onTagChanged: (value: string) => void
  tags: string[]
}

export default function TagSelect(props: TagsProps) {
  return (
    <Select className = "tags"
      onChange = { props.onTagChanged }
    >
      { props.tags.map(tag => <Option key={tag} value={tag}>{tag}</Option>)}
    </Select>
  );
}
