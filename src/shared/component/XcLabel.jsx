// @flow
import React, { Component } from 'react';
import { Label } from 'semantic-ui-react';
import { xlate } from 'shared/util/lang';

type Props = {
    text: string
}

type State = {

}

export class XcLabel extends Component<Props, State> {
    render() {
        const { text } = this.props;
        const t = text.startsWith('#') ? xlate(text.substr(1)) : text; 
        return (
            <Label>{t}</Label>
        );
    }
}
