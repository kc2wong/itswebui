// @flow
import _ from 'lodash'
import * as React from 'react';
import { XcButton } from './XcButton'
import { XcGrid } from './XcGrid'

type XcContextMenuItemProps = {
    title: string,
    description: string,
    buttonLabel: string,
    buttonAction: () => void
}

type XcContextMenuItemState = {

}

class XcContextMenuItem extends React.Component<XcContextMenuItemProps, XcContextMenuItemState> {
    render() {
        const { title, description, buttonLabel, buttonAction } = this.props
        return (
            <React.Fragment>
                <h4>{title}</h4>
                <p style={{ whiteSpace: "nowrap" }}>{description}</p>
                <XcButton label={buttonLabel} name={title} onClick={this.handleButtonClick} primary />
            </React.Fragment>
        )
    }

    handleButtonClick = () => {
        this.props.buttonAction()
    }
    
}   

type XcContextMenuProps = {
    onButtonClick?: () => void,
    children: XcContextMenuItem[]
}

type XcContextMenuState = {

}

export class XcContextMenu extends React.Component<XcContextMenuProps, XcContextMenuState> {
    static Item = XcContextMenuItem

    render() {
        const { ...props } = this.props
        return (
            <XcGrid evenly divider {...props}>
                <XcGrid.Row>
                    {_.map(this.props.children, (e, idx) => <XcGrid.Col key={idx} horizontalAlign={XcGrid.HorizontalAlign.Center}>{e}</XcGrid.Col>)}
                </XcGrid.Row>
            </XcGrid>
        )
    }

}