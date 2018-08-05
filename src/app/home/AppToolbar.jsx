// @flow
import _ from 'lodash';
import React from 'react';
import { Button, Dropdown, Header, Icon, Image, Menu, Popup } from 'semantic-ui-react';
import { Language, xlate } from 'shared/util/lang';
import { formatDate } from 'shared/util/dateUtil';

import logo from 'assets/images/logo.jpg';

type Props = {
    applicationDate: Date,
    language: Language,
    menuOpen: bool,
    onLogout: () => void,
    onMenuClick?: (open: bool) => void,
    username: string
}

type State = {
}

export class AppToolbar extends React.Component<Props, State> {
    
    constructor(props: Props) {
        super(props);

        this.state = {
        };
    }

    render() {
        const { applicationDate, language, menuOpen, onLogout, onMenuClick, username } = this.props

        const formattedDate = formatDate(applicationDate);

        const menuIcon = menuOpen ? 'remove' : 'content';

        return (
            <Menu size='small' style={{ flexShrink: 0, marginBottom: 0 }}>
                {onMenuClick && (<Menu.Item onClick={this.handleOpenMenu} >
                    <Icon name={menuIcon} />
                </Menu.Item>)}
                <Menu.Item >
                    <Image src={logo} />
                </Menu.Item>                
                <Popup
                    trigger={<Menu.Item content={<Header as='h5'>{xlate('applicationName')}</Header>} />}
                    content={xlate('home.versionToolTip', { env: 'DEV', ver: '0.0.1' })}
                />
                <Menu.Item content={xlate('home.greeting', { name: username })} position='right' />
                <Dropdown icon="user" item>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={this.handleChangePassword}>{xlate('home.preference')}</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={this.handleChangePassword}>{xlate('home.changePassword')}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>                
                <Dropdown item text={xlate(`home.lang.${language.value}`)}>
                    <Dropdown.Menu>
                        {_.map(_.filter(Language.enumValues, (x) => {return x != language}), (e) => (
                            <Dropdown.Item 
                                key={e.value} 
                                onClick={this.handleChangeLanguage(e)}
                                text={xlate(`home.lang.${e.value}`)} 
                                value={e.value} 
                            />
                        ))}                                        
                    </Dropdown.Menu>
                </Dropdown>
                <Menu.Item>
                    <Popup
                        trigger={<Icon name='sign out' onClick={onLogout} />}
                        content={xlate('home.logout')}
                    />
                </Menu.Item>                
                <Menu.Item content={formattedDate} />
            </Menu>
        )
    }

    handleChangePassword = () => {

    }
    
    handleChangeLanguage = (language: Language) => {
    }
    
    handleOpenMenu = () => {
        const { menuOpen, onMenuClick } = this.props
        if (onMenuClick) {
            onMenuClick(!menuOpen)
        }
    }
}