// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { XcButton, XcCheckbox, XcForm, XcGrid, XcInputText, XcLabel, XcSelect } from 'shared/component';
import { XcMessage, XcOption } from 'shared/component';
import { createColumnClass } from 'shared/component/XcFormUtil';
import { Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { MessageService } from 'shared/service';
import { BaseModel } from 'shared/model';
import { ApplicationContext } from 'app/context'
import { authenticationService } from 'app/service/security/AuthenticationService'

import './LoginForm.css';

type Props = {
    onLoginSuccess?: (language: Language) => void
}

type IntProps = {
    messageService: MessageService,
    onLoginSuccess?: (language: Language) => void
}

type State = {
    credential: Credential,
    language: Language,
    error?: Object
}

class LoginForm extends Component<IntProps, State> {

    constructor(props: IntProps) {
        super(props);

        this.state = {
            credential: new Credential(),
            language: Language.English
        }
    }

    render() {
        const { credential, language, error } = this.state;
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
                                    <XcInputText icon={{ name: "user" }} name="userid" validation={{ maxLength: 10, required: true }} />
                                    <XcInputText icon={{ name: "lock" }} name="password" password validation={{ required: true }} />
                                    <XcSelect label="Language" name="language" onChange={this.handleChangeLanguage} options={langOpt} validation={{ required: true }} value={language.value} />
                                    <XcCheckbox label="Remember Me" name="rememberMe" />
                                    <p />
                                    <XcButton disabled={isNullOrEmpty(credential.userid) || isNullOrEmpty(credential.password)} fluid primary onClick={this.handleClick} name="login" />
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

    handleChangeLanguage = (event: SyntheticInputEvent<>, target: any) => {
        const lang = _.find(Language.enumValues, (e) => (
            e.value == target.value
        ))
        this.setState({
            language: lang
        })
    }

    handleClick = (event: SyntheticMouseEvent<>) => {
        const { messageService, onLoginSuccess } = this.props
        const { userid, password } = this.state.credential
        const { language } = this.state

        messageService.showLoading()
        authenticationService.login(userid, password).then(
            result => {
                messageService.hideLoading()
                if (onLoginSuccess) {
                    onLoginSuccess(language)
                }
            },
            error => {
                messageService.hideLoading()
                this.setState({error: error})
            }
        )
    }
}

class Credential implements BaseModel {

    userid: string;
    password: string;
    rememberMe: bool;

    static fromJson(json: Object): Credential {
        let rtn = new Credential()
        Object.assign(rtn, json)
        return rtn
    }

    constructor() {
        this.userid = "";
        this.password = "";
        this.rememberMe = false;
    }

    toJson() {
        const rtn = {}
        Object.assign(rtn, this);
        return rtn;
    }
}

export default (props: Props) => (
    <ApplicationContext.Consumer>
        {applicationContext => <LoginForm {...props} messageService={applicationContext.messageService} />}
    </ApplicationContext.Consumer>
);