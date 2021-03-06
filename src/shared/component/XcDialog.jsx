// @flow
import React, { Component } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';
import { Enum } from 'enumify';
import { XcButton, XcButtonGroup } from './';
import { nvl, xlate } from 'shared/util/lang';

class DialogType extends Enum { }
DialogType.initEnum(['Info', 'YesNo', 'YesNoCancel']);

type Props = {
    negativeButton: ?XcButton,
    positiveButton: ?XcButton,
    okButton: ?XcButton,
    content: any,
    title: ?string,
    type: DialogType
}

type State = {
}

export class XcDialog extends React.Component<Props, State> {
    static Type = DialogType

    render() {
        const { negativeButton, positiveButton, okButton, content, type } = this.props;

        const title = nvl(this.props.title, xlate(type == DialogType.Info ? "general.information" : "general.confirm"))

        const showOk = type == DialogType.Info
        const showNo = type == DialogType.YesNo || type == DialogType.YesNoCancel
        const showYes = type == DialogType.YesNo || type == DialogType.YesNoCancel

        return (
            <Modal basic={false} closeOnDimmerClick={false} closeOnEscape={false} defaultOpen={true}>
                <Header content={title} />
                <Modal.Content>
                    {content}
                </Modal.Content>
                <Modal.Actions>
                    {showNo && negativeButton && (negativeButton)}
                    {showYes && positiveButton && (positiveButton)}
                    {showOk && okButton && (okButton)}
                </Modal.Actions>
            </Modal>
        )
    }
}

export const createConfirmationDialog = (confirmPositiveAction: ?(() => void), confirmNegativeAction: () => void, title: ?string, message: string) => {
    const content = <p>{message}</p>
    const positiveButton = <Button positive disabled={confirmPositiveAction == null} onClick={confirmPositiveAction} >
        <Icon name='checkmark' />{xlate("general.yes")}
    </Button>
    const negativeButton = <Button negative onClick={confirmNegativeAction} >
        <Icon name='remove' />{xlate("general.no")}
    </Button>
    return <XcDialog negativeButton={negativeButton} okButton={null} positiveButton={positiveButton} content={content} title={title ? title : xlate('general.confirm')} type={DialogType.YesNo} />
}