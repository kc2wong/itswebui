// @flow
import React, { Component } from 'react';
import {Enum} from 'enumify';
// import { Button, FormGroup } from 'react-bootstrap';
import { Button, Icon } from 'semantic-ui-react'
import FormContext from './XcForm';
import ButtonGroupContext from './XcButtonGroup';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';
import { constructLabel, createColumnClass, getRequired } from './XcFormUtil';

export class ButtonVisibility extends Enum {}
ButtonVisibility.initEnum(['Disable', 'Hidden', 'Visible']);

type Props = {
    active?: bool,
    fluid?: bool,
    icon: ?XcIconProps,
    label: string,
    onClick?: () => void,
    primary?: bool
}

type State = {

}

export class XcButton extends Component<Props, State> {
    render() {
        const { active, fluid, icon, label, primary, ...props } = this.props;
        const a = parseBool(active, false)
        const t = label.startsWith('#') ? xlate(label.substr(1)) : label
        const b = parseBool(fluid, false)
        const i = icon != null ? {content: t, icon: icon.name} : {}
        const child = icon != null ? null : t
        const p = parseBool(primary, false)

        return (
            <ButtonGroupContext.Consumer>
                {btnGrpCtx => (
                    <FormContext.Consumer>
                        {formCtx => (
                            formCtx == null ?
                                <Button active={a} fluid={b} onClick={this.handleClick()} primary={p} {...i} {...props}>{child}</Button>
                                :
                                <Button active={a} fluid={b} onClick={this.handleClick(formCtx.onSubmit)} primary={p} {...i} {...props}>{child}</Button>
                        )}
                    </FormContext.Consumer>
                )}
            </ButtonGroupContext.Consumer>
        )
    }

    handleClick = (onSubmit?: () => void) => (event: SyntheticMouseEvent<>) => {
        const { onClick } = this.props;
        if (onClick != null) {
            onClick();
        }
        else if (onSubmit != null) {
            onSubmit();
        }
        else {
            console.warn(`Button name=${this.props.label} has no action`)
        }
    }
}
