import * as React from 'react'
import GraphQLBinApp from './GraphQLBinApp'

export default class Root extends React.Component<{}, {}> {
  render() {
    return (
      <GraphQLBinApp endpoint="http://localhost:5000/graphql"/>
    )
  }
}

