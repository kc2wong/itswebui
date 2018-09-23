// @flow
import _ from 'lodash'
import * as React from 'react'
import { Icon } from 'semantic-ui-react'
import { parseBool } from 'shared/util/lang';

export type XcIconProps = {
    disabled: ?boolean,
    name: string,
    onClick?: () => void
}

type XcIconState = {

}

export class XaIcon extends React.Component<XcIconProps, XcIconState> {

    render() {
        const { disabled, name } = this.props
        return (
            <Icon disabled={parseBool(disabled, false)} name={name} onClick={this.handleClick} />
        )
    }

    handleClick = (event: SyntheticEvent<>) => {
        const { disabled, onClick } = this.props
        if (parseBool(disabled, false) == false && onClick) {
            onClick()
        }
    }
}