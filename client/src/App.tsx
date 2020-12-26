import React, { Component } from 'react'

interface AppState {
  repos: string[]
}

export default class App extends Component {
  state: AppState = {
    repos: []
  }

  componentDidMount() {
    fetch('/repos/list')
    .then(response => response.json())
    .then(repos => {
      const repoIds = Object.keys(repos)
      this.setState({repos: repoIds})
    })
    .catch(err => console.error(err))
  }
 
  render() {
    return (
      <div className="App">
        <h1>Repository IDs</h1>
        <ul>
          { this.state.repos.map(repo => <ul key={repo}>{repo}</ul>) }
        </ul>
      </div>
    )
  }
}
