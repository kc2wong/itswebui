// @flow
import _ from 'lodash';
import React from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import { Grid, Segment, Tab } from 'semantic-ui-react'
import { XcButton, XcCheckbox, XcForm, XcInputText, XcLabel, XcSelect, XcNavigationTab } from 'shared/component';
import { XcDialog, XcLoader, XcOption } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { MessageService } from 'shared/service';
import { AppToolbar, navigator, SidebarMenu } from 'app/home';
import RetailHome from 'app/home/RetailHome';
import { userProfileService } from 'app/service';
import { ApplicationContext, type ApplicationContextType } from 'app/context'
import LoginForm from 'app/component/security/LoginForm';

// export type ApplicationContextType = {
//     messageService: MessageService
// }

// export const ApplicationContext = React.createContext({
//     messageService: {
//         hideLoading: () => {},
//         showLoading: () => {},
//         dismissDialog: () => {},
//         showDialog: (dialog: XcDialog) => {},
//         isDialogShowing: () => {return false}    
//     }    
// });

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
            dismissDialog: (dialog: XcDialog) => {
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

        const retailHome = <RetailHome language={Language.English}/>
        return (
            <React.Fragment>
                <ApplicationContext.Provider value={{messageService: messageService}}>
                    {loading > 0 && (<XcLoader message={xlate("general.loadingIndicator")} />)}
                    {dialog != null && (dialog)}
                    <Router history={navigator}>
                        <Switch>
                            <PrivateRoute exact path="/" component={RetailHome} />
                            <Route path={loginPath} render={(props) => (
                                <LoginForm onLoginSuccess={this.handleLoginSuccess} />
                            )} />
                        </Switch>
                    </Router>
                </ApplicationContext.Provider>
            </React.Fragment>
        )
    }

    handleLoginSuccess = (language: Language) => {
        navigator.push("/", {language: language.value})
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