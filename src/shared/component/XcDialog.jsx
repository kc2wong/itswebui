// @flow
import React, { Component } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';
import { Enum } from 'enumify';
import { XcButton, XcButtonGroup } from './';
import { nvl, xlate } from 'shared/util/lang';

class DialogType extends Enum {}
DialogType.initEnum(['Info', 'YesNo', 'YesNoCancel']);

type Props = {
    confirmOkAction: ?() => void,
    confirmNoAction: ?() => void,
    confirmYesAction: ?() => void,
    content: ?React.Component<any, any>,
    message: ?string,
    title: ?string,
    type: DialogType
}

type State = {
}

export class XcDialog extends React.Component<Props, State> {
    static Type = DialogType

    render() {
        const { confirmNoAction, confirmOkAction, confirmYesAction, content, message, type } = this.props;

        const title = nvl(this.props.title, xlate(type == DialogType.Info ?  "general.information" : "general.confirm"))

        const onClickForOk = confirmOkAction != null ? { onClick: confirmOkAction } : {};
        const onClickForNo = confirmNoAction != null ? { onClick: confirmNoAction } : {};
        const onClickForYes = confirmYesAction != null ? { onClick: confirmYesAction } : {};

        const showOk = type == DialogType.Info
        const showNo = type == DialogType.YesNo || type == DialogType.YesNoCancel
        const showYes = type == DialogType.YesNo || type == DialogType.YesNoCancel
        
        console.log(content)
        return (
            <Modal basic={false} closeOnDimmerClick={false} closeOnEscape={false} defaultOpen={true}>
                <Header content={title} />
                <Modal.Content>
                    {content ? content : <p>{message}</p>}
                </Modal.Content>
                <Modal.Actions>
                    {showNo && (<Button negative {...onClickForNo}>
                        <Icon name='remove' />{xlate("general.no")}
                    </Button>)}
                    {showYes && (<Button positive {...onClickForYes} >
                        <Icon name='checkmark' />{xlate("general.yes")}
                    </Button>)}
                    {showOk && (<Button primary {...onClickForOk}>
                        <Icon name='checkmark' />{xlate("general.ok")}
                    </Button>)}
                </Modal.Actions>
            </Modal>
        )              
    }
}