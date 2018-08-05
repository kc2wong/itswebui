// @flow
import React, { Component } from 'react';
import { XcButton, XcButtonGroup, ButtonVisibility, XcGrid, XcGridCol, XcGridRow } from 'shared/component';
import { xlate } from 'shared/util/lang';
import { Mode } from 'shared/model';

type Props = {
    title: string,
    backButtonVisibility: ?ButtonVisibility,
    backButtonAction: ?() => void,
    deleteButtonVisibility: ?ButtonVisibility,
    deleteButtonAction: ?() => void,
    editButtonVisibility: ?ButtonVisibility,
    editButtonAction: ?() => void,
    newButtonVisibility: ?ButtonVisibility,
    newButtonAction: ?() => void,
    refreshButtonVisibility: ?ButtonVisibility,
    refreshButtonAction: ?() => void,
    saveButtonVisibility: ?ButtonVisibility,
    saveButtonAction: ?() => void,
    viewButtonVisibility: ?ButtonVisibility,
    viewButtonAction: ?() => void,
    style: ?Object
}

type State = {
}

export class Toolbar extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
        }
    }

    render() {
        const { title, style } = this.props;
        const { backButtonVisibility, deleteButtonVisibility, editButtonVisibility, newButtonVisibility, refreshButtonVisibility, saveButtonVisibility, viewButtonVisibility } = this.props;
        const { backButtonAction, deleteButtonAction, editButtonAction, newButtonAction, refreshButtonAction, saveButtonAction, viewButtonAction } = this.props;
        const backButtonVisible = this.calculateButtonVisible(backButtonVisibility)
        const backButtonDisable = this.calculateButtonDisable(backButtonVisibility)
        const deleteButtonVisible = this.calculateButtonVisible(deleteButtonVisibility)
        const deleteButtonDisable = this.calculateButtonDisable(deleteButtonVisibility)
        const editButtonVisible = this.calculateButtonVisible(editButtonVisibility)
        const editButtonDisable = this.calculateButtonDisable(editButtonVisibility)
        const newButtonVisible = this.calculateButtonVisible(newButtonVisibility)
        const newButtonDisable = this.calculateButtonDisable(newButtonVisibility)
        const refreshButtonVisible = this.calculateButtonVisible(refreshButtonVisibility)
        const refreshButtonDisable = this.calculateButtonDisable(refreshButtonVisibility)
        const saveButtonVisible = this.calculateButtonVisible(saveButtonVisibility)
        const saveButtonDisable = this.calculateButtonDisable(saveButtonVisibility)
        const viewButtonVisible = this.calculateButtonVisible(viewButtonVisibility)
        const viewButtonDisable = this.calculateButtonDisable(viewButtonVisibility)

        const backButtonOnClick = backButtonAction != null ? { onClick: backButtonAction } : {}
        const deleteButtonOnClick = editButtonAction != null ? { onClick: deleteButtonAction } : {}
        const editButtonOnClick = editButtonAction != null ? { onClick: editButtonAction } : {}
        const newButtonOnClick = newButtonAction != null ? { onClick: newButtonAction } : {}
        const refreshButtonOnClick = refreshButtonAction != null ? { onClick: refreshButtonAction } : {}
        const saveButtonOnClick = saveButtonAction != null ? { onClick: saveButtonAction } : {}
        const viewButtonOnClick = viewButtonAction != null ? { onClick: viewButtonAction } : {}
        
        const s = Object.assign({ flexShrink: 0, margin: 0 }, style ? style : {} )
        return (
            <React.Fragment>
                <XcGrid style={s}>
                    <XcGrid.Row>
                        <XcGrid.Col width={8}>
                            <h3><b>{title}</b></h3>
                        </XcGrid.Col>
                        <XcGrid.Col alignRight={true} width={8}>
                            <XcButtonGroup>
                                {backButtonVisible && <XcButton disabled={backButtonDisable} icon={{name: "undo"}} label={xlate("general.back")} {...backButtonOnClick} />}
                                {editButtonVisible && <XcButton disabled={editButtonDisable} icon={{name: "pencil"}} label={xlate("general.edit")} {...editButtonOnClick} />}
                                {viewButtonVisible && <XcButton disabled={viewButtonDisable} icon={{name: "eye"}} label={xlate("general.view")} {...viewButtonOnClick} />}
                                {refreshButtonVisible && <XcButton disabled={refreshButtonDisable} icon={{name: "refresh"}} label={xlate("general.refresh")} {...refreshButtonOnClick} />}
                                {newButtonVisible && <XcButton disabled={newButtonDisable} icon={{name: "plus"}} label={xlate("general.new")} {...newButtonOnClick} />}                                
                                {saveButtonVisible && <XcButton disabled={saveButtonDisable} icon={{name: "save"}} label={xlate("general.save")} {...saveButtonOnClick} />}                                
                                {deleteButtonVisible && <XcButton disabled={editButtonDisable} icon={{name: "trash"}} label={xlate("general.delete")} {...deleteButtonOnClick} />}
                            </XcButtonGroup>
                        </XcGrid.Col>
                    </XcGrid.Row>
                </XcGrid>
            </React.Fragment>
        )
    }

    calculateButtonVisible(buttonVisibility: ButtonVisibility): bool {
        return buttonVisibility == null || buttonVisibility != ButtonVisibility.Hidden;
    }

    calculateButtonDisable(buttonVisibility: ButtonVisibility): bool {
        return buttonVisibility != null && buttonVisibility == ButtonVisibility.Disable;
    }
    
}