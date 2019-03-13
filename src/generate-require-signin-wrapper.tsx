import * as React from 'react'
import { ComponentClass } from 'react'
import { connect } from 'react-redux'
import {
  GenerateRequireSignInWrapperConfig,
  ReduxState,
  RequireSignInWrapper,
} from './types'

const generateRequireSignInWrapper = (
  { redirectPathIfNotSignedIn }: GenerateRequireSignInWrapperConfig
): RequireSignInWrapper => {
  const requireSignInWrapper = (PageComponent: ComponentClass, resourceType: string): ComponentClass => {
    interface WrapperProps {
      readonly hasVerificationBeenAttempted: boolean
      readonly isSignedIn: boolean
      readonly history: any
    }

    class GatedPage extends React.Component<WrapperProps> {
      public componentDidMount(): void {
        const {
          history,
          hasVerificationBeenAttempted,
          isSignedIn,
        } = this.props

        const localResourceType = localStorage.getItem('resource-type')

        if (hasVerificationBeenAttempted && !isSignedIn) {
          history.replace({
            pathname: redirectPathIfNotSignedIn,
            state: { snackbarMessage: { variant: 'error', messages: ['You need to sign in or sign up before continuing.'] } },
          });
        }

        if (isSignedIn && resourceType !== localResourceType) {
          history.replace({
            pathname: '/',
            state: { snackbarMessage: { variant: 'error', messages: [`You're unable to access that page while logged in as a ${localResourceType}.`] } },
          });
        }
      }

      public render (): JSX.Element {
        const {
          hasVerificationBeenAttempted,
          isSignedIn,
        } = this.props

        const localResourceType = localStorage.getItem('resource-type')

        return (hasVerificationBeenAttempted && isSignedIn && resourceType === localResourceType) ?
          <PageComponent {...this.props} />
          :
          <div></div>;
      }
    }

    const mapStateToProps = (state: ReduxState) => ({
      hasVerificationBeenAttempted: state.reduxTokenAuth.currentUser.hasVerificationBeenAttempted,
      isSignedIn: state.reduxTokenAuth.currentUser.isSignedIn
    })

    return connect(
      mapStateToProps,
    )(GatedPage)
  }

  return requireSignInWrapper
}

export default generateRequireSignInWrapper
