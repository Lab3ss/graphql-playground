import { Record } from 'immutable'
import { handleActions } from 'redux-actions'

export class SharingState extends Record({
  history: false,
  headers: true,
  allTabs: true,
  shareUrl: null,
    emailToken: '',
    token: '',
}) {
  history: boolean
  headers: boolean
  allTabs: boolean
    token: string
    emailToken: string
  shareUrl: any // go away typescript
}

export default handleActions(
  {
    TOGGLE_SHARE_HISTORY: state => state.set('history', !state.history),
    TOGGLE_SHARE_HEADERS: state => state.set('headers', !state.headers),
    TOGGLE_SHARE_ALL_TABS: state => state.set('allTabs', !state.allTabs),
      EDIT_EMAIL_TOKEN: (state, { payload: { emailToken } }) => state.set('emailToken', emailToken),
      EDIT_TOKEN: (state, { payload: { token } }) => state.set('token', token),
    SET_SHARE_URL: (state, { payload: { shareUrl } }) =>
      state.set('shareUrl', shareUrl),
  },
  new SharingState(),
)
