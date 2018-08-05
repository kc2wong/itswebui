// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { XcButton, XcCheckbox, XcForm, XcGrid, XcInputText, XcLabel, XcSelect } from 'shared/component';
import { XcMessage, XcOption } from 'shared/component';
import { createColumnClass } from 'shared/component/XcFormUtil';
import { Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { MessageContext, MessageService } from 'shared/service';
import { BaseModel } from 'shared/model';
import { authenticationService } from 'app/service/security/AuthenticationService';
import './LoginForm.css';

type Props = {
    messageService?: MessageService,
    onLoginSuccess?: () => void
}

type State = {
    credential: Credential,
    error?: Object
}

class LoginForm extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            credential: new Credential()
        }
    }

    render() {
        const { credential, error } = this.state;
        const langOpt = _.map(Language.enumValues, (e) => (
            new XcOption(e.value, xlate(`home.lang.${e.value}`))
        ))

        return (
            <div>
                <div className='leftPanel' >
                    <div className='topFiller' />
                    <XcGrid>
                        <XcGrid.Row centered>
                            <XcGrid.Col>
                            <XcForm model={credential} name="loginForm" onModelUpdate={this.handleModelUpdate} style={{ "marginLeft": "20px", "marginRight": "20px" }}>
                                <div className={createColumnClass()}>
                                    <header>
                                        <div style={{ "margin": 0, "padding": 0 }}>{xlate("loginForm.welcomeTo")}</div>
                                        <h2 style={{ "margin": 0, "padding": 0 }}>{xlate("applicationName")}</h2>
                                    </header>
                                    <br />
                                </div>
                                <XcInputText icon={{ name: "user" }} label="#loginForm.username" name="userid" validation={{ required: true }} />
                                <XcInputText icon={{ name: "lock" }} label="Password" name="password" password validation={{ required: true }} />
                                <XcSelect label="Language" name="language" options={langOpt} />
                                <XcCheckbox label="Remember Me" name="rememberMe" />
                                <p />
                                <XcButton disabled={isNullOrEmpty(credential.userid) || isNullOrEmpty(credential.password)} fluid primary onClick={this.handleClick} label="Login" />
                            </XcForm>
                            </XcGrid.Col>
                        </XcGrid.Row>
                        {error && (
                            <XcGrid.Row centered style={{ "marginLeft": "20px", "marginRight": "20px" }}>
                                <XcGrid.Col>
                                    <XcMessage header={error.errorCode} message={xlate(`error.${error.errorCode}`)} type={XcMessage.Type.Error} />
                                </XcGrid.Col>
                            </XcGrid.Row>
                        )}
                    </XcGrid>
                    <div className='footer'>{xlate('loginForm.copyRight')}</div>
                </div>
                <div className='rightPanel'></div>
            </div >
        )
    }

    handleModelUpdate = (model: Object) => {
        this.setState({
            credential: Credential.fromJson(model)
        })
    }

    handleClick = (event: SyntheticMouseEvent<>) => {
        const { messageService, onLoginSuccess } = this.props
        const { userid, password } = this.state.credential

        messageService && messageService.showLoading()
        authenticationService.login(userid, password).then(
            result => {
                messageService && messageService.hideLoading()
                console.log(result);
                if (onLoginSuccess) {
                    onLoginSuccess()
                }
            },
            error => {
                messageService && messageService.hideLoading()
                console.log(error)
                this.setState({error: error})
            }
        )
    }
}

class Credential implements BaseModel {

    userid: string;
    password: string;
    rememberMe: bool;
    language: string;

    static fromJson(json: Object): Credential {
        let rtn = new Credential()
        Object.assign(rtn, json)
        return rtn
    }

    constructor() {
        this.userid = "";
        this.password = "";
        this.rememberMe = false;
        this.language = Language.English.value;
    }

    toJson() {
        const rtn = {}
        Object.assign(rtn, this);
        return rtn;
    }
}

export default (props: Props) => (
    <MessageContext.Consumer>
        {messageService => <LoginForm {...props} messageService={messageService} />}
    </MessageContext.Consumer>
);