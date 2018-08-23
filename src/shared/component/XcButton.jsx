// @flow
import React, { Component } from 'react';
import {Enum} from 'enumify';
// import { Button, FormGroup } from 'react-bootstrap';
import { Button, Icon } from 'semantic-ui-react'
import FormContext from './XcForm';
import type { FormContextType } from './XcForm';
import ButtonGroupContext from './XcButtonGroup';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';
import { constructLabel } from './XcFormUtil';

export class ButtonVisibility extends Enum {}
ButtonVisibility.initEnum(['Disable', 'Hidden', 'Visible']);

type Props = {
    active?: bool,
    fluid?: bool,
    icon: ?XcIconProps,    
    label: string,
    name: string,
    onClick?: () => void,
    primary?: bool
}

type State = {

}

export class XcButton extends Component<Props, State> {
    render() {
        const { active, fluid, icon, label, name, primary, ...props } = this.props;
        const a = parseBool(active, false)
        const b = parseBool(fluid, false)
        const p = parseBool(primary, false)
        
        return (
            <ButtonGroupContext.Consumer>
                {btnGrpCtx => (
                    <FormContext.Consumer>
                        {formCtx => (
                            formCtx != null ?
                            <Button active={a} fluid={b} onClick={this.handleClick(formCtx.onSubmit)} primary={p} {... this.constructIcon(formCtx.name, name, icon, label)} {...props}>{this.constructChild(formCtx, name, icon, label)}</Button>
                            :
                            <Button active={a} fluid={b} onClick={this.handleClick(null)} primary={p} {... this.constructIcon(null, name, icon, label)} {...props}>{this.constructChild(formCtx, name, icon, label)}</Button>
                        )}
                    </FormContext.Consumer>
                )}
            </ButtonGroupContext.Consumer>
        )
    }

    handleClick = (onSubmit: ?() => void) => (event: SyntheticMouseEvent<>) => {
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

    constructIcon (formName: ?string, fieldName: string, icon: ?XcIconProps, label: ?string): Object {
         const t = label != null ? (label.startsWith('#') ? xlate(label.substr(1)) : label) : (formName != null ? xlate(`${formName}.${fieldName}`) : label)
         return icon != null ? {content: t, icon: icon.name} : {}
    }
    
    constructChild (formContext: FormContextType, fieldName: string, icon: ?XcIconProps, label: ?string): ?string {
        const t = label != null ? (label.startsWith('#') ? xlate(label.substr(1)) : label) : xlate(`${formContext.name}.${fieldName}`)
        return icon != null ? null : t
   }    
}
