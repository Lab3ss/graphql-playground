import * as React from 'react'
import { styled, withProps } from '../../../styled/index'
import * as copy from 'copy-to-clipboard'

import Share from '../../Share'
import ReloadIcon from './ReloadIcon'
import { createStructuredSelector } from 'reselect'
import {
  getEndpoint,
  getSelectedSession,
  getIsReloadingSchema,
  getEndpointUnreachable,
} from '../../../state/sessions/selectors'
import { getEmailToken } from '../../../state/sharing/selectors'
import { connect } from 'react-redux'
import { getFixedEndpoint } from '../../../state/general/selectors'
import * as PropTypes from 'prop-types'
import {
  editEmailToken,
  editEndpoint,
  editToken,
  prettifyQuery,
  refetchSchema,
} from '../../../state/sessions/actions'
import { share } from '../../../state/sharing/actions'
import { openHistory } from '../../../state/general/actions'

export interface Props {
  endpoint: string
  emailToken: string
  shareEnabled?: boolean
  fixedEndpoint?: boolean
  isReloadingSchema: boolean
  endpointUnreachable: boolean

  editEndpoint: (value: string) => void
  editEmailToken: (value: string) => void
  editToken: (value: string) => void
  prettifyQuery: () => void
  openHistory: () => void
  share: () => void
  refetchSchema: () => void
}

class TopBar extends React.Component<Props, {}> {
  static contextTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
  }
  fetchToken = async () => {
    const res = await fetch('http://localhost:5000/token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mail: this.props.emailToken }),
    })
    const token = await res.text()
    this.props.editToken(token)
  }
  render() {
    const { endpointUnreachable } = this.props
    return (
      <TopBarWrapper>
        <TokenBarWrapper>
          <TokenBar
            value={this.props.emailToken}
            onChange={this.onChangeTokenEmail}
            onKeyDown={this.onKeyDown}
            onBlur={() => {}}
            disabled={false}
            active={true}
          />
          <Button onClick={this.fetchToken}>Get Token !</Button>
        </TokenBarWrapper>
        <Button onClick={this.props.prettifyQuery}>Prettify</Button>
        <Button onClick={this.openHistory}>History</Button>
        <UrlBarWrapper>
          <UrlBar
            value={this.props.endpoint}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            onBlur={this.props.refetchSchema}
            disabled={this.props.fixedEndpoint}
            active={!this.props.fixedEndpoint}
          />
          {endpointUnreachable ? (
            <ReachError>
              <span>Server cannot be reached</span>
              <Spinner />
            </ReachError>
          ) : (
            <ReloadIcon
              isReloadingSchema={this.props.isReloadingSchema}
              onReloadSchema={this.props.refetchSchema}
            />
          )}
        </UrlBarWrapper>
        <Button onClick={this.copyCurlToClipboard}>Copy CURL</Button>
        {this.props.shareEnabled && (
          <Share>
            <Button>Share Playground</Button>
          </Share>
        )}
      </TopBarWrapper>
    )
  }
  copyCurlToClipboard = () => {
    const curl = this.getCurl()
    copy(curl)
  }
  onChange = e => {
    this.props.editEndpoint(e.target.value)
  }
  onChangeTokenEmail = e => {
    this.props.editEmailToken(e.target.value)
  }
  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.props.refetchSchema()
    }
  }
  openHistory = () => {
    this.props.openHistory()
  }
  getCurl = () => {
    // no need to rerender the whole time. only on-demand the store is fetched
    const session = getSelectedSession(this.context.store.getState())
    let variables
    try {
      variables = JSON.parse(session.variables)
    } catch (e) {
      //
    }
    const data = JSON.stringify({
      query: session.query,
      variables,
      operationName: session.operationName,
    })
    let sessionHeaders
    try {
      sessionHeaders = JSON.parse(session.headers!)
    } catch (e) {
      //
    }
    const headers = {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Connection: 'keep-alive',
      DNT: '1',
      Origin: location.origin || session.endpoint,
      ...sessionHeaders,
    }
    const headersString = Object.keys(headers)
      .map(key => {
        const value = headers[key]
        return `-H '${key}: ${value}'`
      })
      .join(' ')
    return `curl '${
      session.endpoint
    }' ${headersString} --data-binary '${data}' --compressed`
  }
}

const mapStateToProps = createStructuredSelector({
  endpoint: getEndpoint,
  emailToken: getEmailToken,
  fixedEndpoint: getFixedEndpoint,
  isReloadingSchema: getIsReloadingSchema,
  endpointUnreachable: getEndpointUnreachable,
})

export default connect(
  mapStateToProps,
  {
    editEndpoint,
    editEmailToken,
    editToken,
    prettifyQuery,
    openHistory,
    share,
    refetchSchema,
  },
)(TopBar)

export const Button = styled.button`
  text-transform: uppercase;
  font-weight: 600;
  color: ${p => p.theme.editorColours.buttonText};
  background: ${p => p.theme.editorColours.button};
  border-radius: 2px;
  flex: 0 0 auto;
  letter-spacing: 0.53px;
  font-size: 14px;
  padding: 6px 9px 7px 10px;
  * + & {
    margin-left: 6px;
  }
  cursor: pointer;
  transition: 0.1s linear background-color;
  &:hover {
    background-color: ${p => p.theme.editorColours.buttonHover};
  }
` as any

const TopBarWrapper = styled.div`
  display: flex;
  background: ${p => p.theme.editorColours.navigationBar};
  padding: 10px 10px 4px;
  align-items: center;
`

interface UrlBarProps {
  active: boolean
}

const UrlBar = withProps<UrlBarProps>()(styled.input)`
  background: ${p => p.theme.editorColours.button};
  border-radius: 4px;
  color: ${p =>
    p.active
      ? p.theme.editorColours.navigationBarText
      : p.theme.editorColours.textInactive};
  border: 1px solid ${p => p.theme.editorColours.background};
  padding: 6px 12px;
  font-size: 13px;
  flex: 1;
`

const UrlBarWrapper = styled.div`
  flex: 1;
  margin-left: 6px;
  position: relative;
  display: flex;
  align-items: center;
`

const TokenBar = withProps<UrlBarProps>()(styled.input)`
  background: ${p => p.theme.editorColours.button};
  border-radius: 4px;
  color: ${p =>
    p.active
      ? p.theme.editorColours.navigationBarText
      : p.theme.editorColours.textInactive};
  border: 1px solid ${p => p.theme.editorColours.background};
  padding: 6px 12px;
  font-size: 13px;
  flex: 0.9;
`
const TokenBarWrapper = styled.div`
  flex: 0.5;
  margin-left: 6px;
  position: relative;
  display: flex;
  align-items: center;
`

const ReachError = styled.div`
  position: absolute;
  right: 5px;
  display: flex;
  align-items: center;
  color: #f25c54;
`

const Pulse = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${p => p.theme.editorColours.icon};
  border-radius: 100%;
`

const SpinnerWrapper = styled.div`
  position: relative;
  margin: 6px;
`

const Spinner = () => (
  <SpinnerWrapper>
    <Pulse />
  </SpinnerWrapper>
)
