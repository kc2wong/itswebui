
import React, { Component } from 'react';
import { Enum } from 'enumify';
import { Message } from 'semantic-ui-react';

class MessageType extends Enum {}
MessageType.initEnum({ Error: { value: 'negative' }, Info: { value: 'success' }, Warning: { value: 'warning' } });

type Props = {
    header: string,
    message: string,
    type: MessageType
}

type State = {

}

export class XcMessage extends Component<Props, State> {
    static Type = MessageType;
    
    render() {
        const { header, message, type, ...props } = this.props;
        const c = message ? { content: message} : {}
        const h = header ? { header: header} : {}
        const x = type.value

        const t = type == MessageType.Error ? { error: true, icon: 'ban' } : ( type == MessageType.Warning ? { warning: true, icon: 'warning sign' } : { success: true, icon: 'checkmark' })
        return (
            <Message content={message} header={header} {...props} {...t} />
        )
    }
}
