// @flow
import React, { Component } from 'react';
import { Enum } from 'enumify';
import { Button, Icon } from 'semantic-ui-react'
import FormContext from './XcForm';
import type { ThemeContextType } from './XaTheme';
import { ThemeContext } from './XaTheme'
import type { FormContextType } from './XcForm';
import ButtonGroupContext from './XcButtonGroup';
import type { XcIconProps } from './XcIconProps';
import { parseBool, xlate } from 'shared/util/lang';
import { constructLabel, getFormContext } from './XcFormUtil';
import { ValidationStatus } from './validation/XaValidationStatus'

export class ButtonVisibility extends Enum {}
ButtonVisibility.initEnum(['Disable', 'Hidden', 'Visible']);

export class ButtonType extends Enum {}
ButtonType.initEnum(['Submit', 'Reset']);

type Props = {
    active?: bool,
    fluid?: bool,
    icon?: XcIconProps,    
    label: string,
    name: string,
    onClick?: () => void,
    primary?: bool,
    type?: ButtonType
}

type State = {

}

export class XcButton extends Component<Props, State> {
    static Type = ButtonType
    
    render() {
        const { active, fluid, icon, label, onClick, name, primary, type, ...props } = this.props;
        const a = parseBool(active, false)
        const b = parseBool(fluid, false)
        const p = parseBool(primary, false)
        
        return (
            <ThemeContext.Consumer>
                {theme => (
                    <ButtonGroupContext.Consumer>
                        {btnGrpCtx => (
                            <FormContext.Consumer>
                                {formCtx => (
                                    formCtx != null ?
                                        <Button active={a} fluid={b} onClick={this.handleClick(formCtx.onSubmit)} {... this.constructColor(p, theme)} {... this.constructIcon(formCtx.name, name, icon, label)} {...props}>{this.constructChild(formCtx, name, icon, label)}</Button>
                                        :
                                        <Button active={a} fluid={b} onClick={this.handleClick(null)} primary={p} {... this.constructIcon(null, name, icon, label)} {...props}>{this.constructChild(formCtx, name, icon, label)}</Button>
                                )}
                            </FormContext.Consumer>
                        )}
                    </ButtonGroupContext.Consumer>
                )}
            </ThemeContext.Consumer>
        )
    }

    handleClick = (onSubmit: ?() => void) => (event: SyntheticMouseEvent<>) => {
        const { onClick, type } = this.props;

        const formContext = getFormContext(this.props)
        if (formContext != null && ButtonType.Submit == type) {
            formContext.validate().then(result => {                
                console.log(`Form validation result = ${result.toString()}`)
                if (result == ValidationStatus.ValidateSuccess) {
                    this.doAction(onSubmit)
                }
            })
        }
        else {
            this.doAction(onSubmit)
        }
    }

    doAction(onSubmit: ?() => void) {
        const { onClick } = this.props;
        if (onClick != null) {
            onClick();
        }
        else if (onSubmit != null) {
            onSubmit();
        }
        else {
            console.warn(`Button name=${this.props.name} has no action`)
        }
    }

    constructColor = (primary: boolean, theme: ThemeContextType): Object => {
        return primary ? { style: { backgroundColor: theme.primary, color: theme.onPrimary } } : {}
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

export const XaButton = (props: Props) => (    
    <FormContext.Consumer>
        {context =>
            <XcButton context={context} {...props} />
        }
    </FormContext.Consumer>
)