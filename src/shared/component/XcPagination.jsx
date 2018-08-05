// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { Icon, Menu, Pagination } from 'semantic-ui-react';
import { nvl, parseBool } from 'shared/util/lang';

import './XcPagination.css';

type Props = {
    activePage: number,
    totalPages?: number,
    range?: number[],
    freeNavigate: ?bool,            // If true, totalPages is calculated correctly in server.  Otherwise, can only navigate prev / next page
    onPageChange: (pageNum: number) => void
}

type State = {

}

export class XcPagination extends Component<Props, State> {

    render() {
        const { activePage, onPageChange, range, totalPages } = this.props;
        const freeNavigate = parseBool(this.props.freeNavigate, true);

        return (
            range != null ?
                <Menu size="mini" pagination>
                    {_.map(range, (i) =>
                        <Menu.Item key={i} active={i === activePage} name={i.toString()} onClick={onPageChange(i)} />
                    )}
                </Menu>
                :
                freeNavigate ?
                    <Pagination size="mini"
                        boundaryRange={0}
                        defaultActivePage={activePage}
                        ellipsisItem={null}
                        firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                        lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                        prevItem={{ content: <Icon name='angle left' />, icon: true }}
                        nextItem={{ content: <Icon name='angle right' />, icon: true }}
                        onPageChange={this.handlePageChange}
                        siblingRange={2}
                        totalPages={totalPages} />
                    :
                    <Menu size="mini" pagination>
                        <Menu.Item disabled={activePage == 1} icon='angle left' onClick={this.handlePrevPage} />
                        <Menu.Item active={true} name={activePage.toString()} />
                        <Menu.Item disabled={activePage == totalPages} icon='angle right' onClick={this.handleNextPage} />
                    </Menu>                
        );
    }

    handlePrevPage = (event: SyntheticEvent<>, data: Object) => {
        const { activePage } = this.props;
        this.props.onPageChange(activePage - 1)
    }

    handleNextPage = (event: SyntheticEvent<>, data: Object) => {
        const { activePage } = this.props;
        this.props.onPageChange(activePage + 1)
    }

    handlePageChange = (event: SyntheticEvent<>, data: Object) => {
        const target = event.target
        if (data && data.activePage && Number.isInteger(data.activePage)) {
            this.props.onPageChange(data.activePage)
        }
        else {
            console.warn(`Invalid activePage ${data ? data.toString() : ""}`)
        }
    }
}
