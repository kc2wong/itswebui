// @flow
import _ from 'lodash';
import * as React from 'react';
import { Table } from 'semantic-ui-react';

import { DataType, SortDirection } from 'shared/model';
import { parseBool, xlate } from 'shared/util/lang';

export class XcTableColSpec {
    dataType: DataType;
    label: string;
    name: string;
    sortDirection : ?SortDirection;
    width: number;

    constructor(name: string, dataType: DataType, label: string, width: number, sortDirection: ?SortDirection = null) {
        this.dataType = dataType;
        this.label = label;
        this.name = name;
        this.width = width;
        this.sortDirection = sortDirection;
    }
}

const NUM_OF_COL = 16

type Props = {
    colspec: XcTableColSpec[],
    compact: ?bool,
    data: Object[],
    onSelectionChange: ?(number) => {},
    onSort: ?(string, SortDirection) => void;
    selectedIndex: ?number
}

type State = {
    selectedIndex: number
}

export class XcTable extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = this.defaultState(props);
    }

    render() {
        const { colspec, compact, data, ...props } = this.props;
        const { selectedIndex } = this.state;

        const totalWidth = _.sumBy(colspec, (cs) => (
            cs.width
        ));

        return (
            <Table sortable columns={NUM_OF_COL} celled compact selectable size="small">
                <Table.Header>
                    <Table.Row>
                        {_.map(colspec, (cs) => (
                            <Table.HeaderCell key={cs.name} onClick={this.handleSort(`${cs.name}`)} sorted={cs.sortDirection? this.sortDirectionValue(cs.sortDirection) : null} width={cs.width}>{cs.label}</Table.HeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>            
                <Table.Body>
                    {_.map(data, (row, rowIdx) => (
                        <Table.Row active={selectedIndex === rowIdx} onClick={this.handleClick(rowIdx)} key={rowIdx}>
                            {_.map(colspec, (cs, colIdx) => (
                                <Table.Cell key={colIdx} width={cs.width}>{row[cs.name]}</Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        )
    }

    handleClick = (row: number) => (event: SyntheticMouseEvent<>) => {
        this.setState({ selectedIndex: row }, () => {
            if (this.props.onSelectionChange) {
                this.props.onSelectionChange(row);
            }
        });
    }
    
    handleSort = (nextSortBy: string) => (event: SyntheticMouseEvent<>) => {
        const { colspec, onSort } = this.props
        if (onSort) {
            // const { sortBy, sortDirection } = this.state
            const sortField = _.find(colspec, cs => cs.sortDirection != null)
            let nextDirection = SortDirection.Ascending
            if ( nextSortBy == sortField.name ) {
                // same column, reverse direction
                nextDirection = SortDirection.Ascending == sortField.sortDirection ? SortDirection.Descending : SortDirection.Ascending
            }
            console.log(sortField)
            console.log(nextDirection)
            onSort(nextSortBy, nextDirection)
        }
    }

    defaultState(props: Props): State {
        return {
            selectedIndex: props.selectedIndex != null ? props.selectedIndex : -1
        }
    }

    sortDirectionValue(sortDirection: SortDirection): string {
        return sortDirection == SortDirection.Descending ? "descending" : "ascending"
    }
}
