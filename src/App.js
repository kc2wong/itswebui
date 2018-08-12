// @flow
import _ from 'lodash';
import React from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import { Grid, Segment, Tab } from 'semantic-ui-react'
import { XcButton, XcCheckbox, XcForm, XcInputText, XcLabel, XcSelect, XcNavigationTab } from 'shared/component';
import { XcDialog, XcLoader, XcOption } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { Currency } from 'app/model/staticdata';
import { MessageContext, MessageService } from 'shared/service';
import { AppToolbar, navigator, SidebarMenu } from 'app/home';
// import Home from 'app/home/Home';
import Home from 'app/home/RetailHome';
import { userProfileService } from 'app/service';

import LoginForm from 'app/component/security/LoginForm';

type Props = {
}

type State = {
    dialog: ?XcDialog,
    loading: number,
    menuOpen: bool
}

const loginPath = '/login';

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            dialog: null,
            loading: 0,
            menuOpen: false
        }
    }

    render() {
        const { dialog, loading, menuOpen } = this.state;

        const messageService: MessageService = {
            hideLoading: () => {
                this.setState({ loading: this.state.loading - 1 })        
            },
            showLoading: () => {
                this.setState({ loading: this.state.loading + 1 })
            },
            hideDialog: (dialog: XcDialog) => {
                this.setState({ dialog: dialog })
            },
            showDialog: (dialog: XcDialog) => {
                this.setState({ dialog: dialog })
            },
            isDialogShowing: () => {
                const { dialog } = this.state
                return dialog != null
            }
        }; 
        
        const applicationDate = new Date()

        return (
            <React.Fragment>
                <MessageContext.Provider value={messageService}>
                    {loading > 0 && (<XcLoader message={xlate("general.loadingIndicator")} />)}
                    {dialog != null && (dialog)}
                    <Router history={navigator}>
                        <Switch>
                            <PrivateRoute exact path="/" component={Home} />
                            <Route path={loginPath} render={(props) => (
                                <LoginForm onLoginSuccess={this.handleLoginSuccess} />
                            )} />
                        </Switch>
                    </Router>
                </MessageContext.Provider>
            </React.Fragment>
        )
    }

    handleLoginSuccess = () => {
        navigator.push("/")
    }

    handleLogout = () => {

    }

    closeMenu = () => {
        this.setState({ menuOpen: false })        
    }

    toggleMenu = () => {
        const { menuOpen } = this.state
        this.setState({ menuOpen: !menuOpen })
    }


}

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem('authenticationToken') || sessionStorage.getItem('authenticationToken')
            ? <Component {...props} />
            : <Redirect to={{ pathname: loginPath, state: { from: props.location } }} />
    )} />
)

export default App;