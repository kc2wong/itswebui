// @flow
import _ from 'lodash';
import * as React from 'react';
import { Enum } from 'enumify';
import { Popup, Icon, Table } from 'semantic-ui-react';

import { DataType, SortDirection } from 'shared/model';
import { parseBool, xlate } from 'shared/util/lang';
import { XcContextMenu } from './XcContextMenu'
import { XcGrid } from './XcGrid'

class TableTextAlign extends Enum {}
TableTextAlign.initEnum({ Left: { value: 'left' }, Center: { value: 'center' }, Right: { value: 'right' } });

export class XcTableColSpec {
    actionSheetProvider: ?(Object, string) => XcContextMenu;
    dataType: DataType;
    formatter: ?(Object, string) => string;
    label: string;
    name: string;
    sortDirection : ?SortDirection;
    horizontalAlign: ?TableTextAlign;
    footerHorizontalAlign: ?TableTextAlign;
    width: number;

    constructor(name: string, dataType: DataType, label: string, width: number, sortDirection: ?SortDirection = null) {
        this.dataType = dataType;
        this.label = label;
        this.name = name;
        this.width = width;
        this.sortDirection = sortDirection;
    }
}

class TableSize extends Enum {}
TableSize.initEnum({ Small: { value: 'small' }, Large: { value: 'large' } });

const NUM_OF_COL = 16

type Props = {
    colspec: XcTableColSpec[],
    colorStripeProvider: ?(Object, number) => string;
    data: Object[],
    highlightedIndex: ?number,
    onSelectionChange: ?(number) => {},
    onSort: ?(string, SortDirection) => void;
    selectable: ?boolean,
    selectedIndex: ?number,
    summary: ?Object,
    size: ?TableSize
}

type State = {
    mouseOverIndex: number,
    selectedIndex: number
}

export class XcTable extends React.Component<Props, State> {
    static Size = TableSize
    static TextAlign = TableTextAlign

    constructor(props: Props) {
        super(props);
        this.state = this.defaultState(props);
    }

    render() {
        const { colorStripeProvider, colspec, data, highlightedIndex, selectable, size, summary, ...props } = this.props;
        const { mouseOverIndex, selectedIndex } = this.state;
        const s = size ? { size: size.value } : {}
        const totalWidth = _.sumBy(colspec, (cs) => (
            cs.width
        ));

        return (
            <Table celled columns={totalWidth} compact fixed selectable={parseBool(selectable, true)} sortable {...s} >
                <Table.Header>
                    <Table.Row>
                        {_.map(colspec, (cs) => (
                            <Table.HeaderCell key={cs.name} onClick={this.handleSort(`${cs.name}`)} sorted={cs.sortDirection ? this.sortDirectionValue(cs.sortDirection) : null}
                                {...cs.horizontalAlign ? { textAlign: cs.horizontalAlign.value } : {}} width={cs.width}>{cs.label}</Table.HeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>            
                <Table.Body>
                    {_.map(data, (row, rowIdx) => (
                        <Table.Row active={selectedIndex === rowIdx} warning={highlightedIndex === rowIdx} onClick={this.handleClick(rowIdx)} onMouseEnter={this.handleMouseEnter(rowIdx)} key={rowIdx}>
                            {_.map(colspec, (cs, colIdx) => (
                                this.columnContent(row, cs, mouseOverIndex, rowIdx, colIdx, colorStripeProvider)
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
                {summary && (
                    <Table.Footer>
                        <Table.Row>
                            {_.map(colspec, (cs) => (
                                <Table.HeaderCell key={cs.name} {... cs.footerHorizontalAlign ? {textAlign: cs.footerHorizontalAlign.value} : {}} width={cs.width}>{summary[cs.name]}</Table.HeaderCell>
                            ))}
                        </Table.Row>
                    </Table.Footer>
                )}
            </Table>
        )
    }

    handleMouseEnter = (row: number) => (event: SyntheticMouseEvent<>) => {
        this.setState({ mouseOverIndex: row })
    }

    handleClick = (row: number) => (event: SyntheticMouseEvent<>) => {
        const { selectable } = this.props;
        if (parseBool(selectable, true)) {
            this.setState({ selectedIndex: row }, () => {
                if (this.props.onSelectionChange) {
                    this.props.onSelectionChange(row);
                }
            });    
        }
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
            onSort(nextSortBy, nextDirection)
        }
    }

    defaultState(props: Props): State {
        return {
            mouseOverIndex: -1,
            selectedIndex: props.selectedIndex != null ? props.selectedIndex : -1
        }
    }

    sortDirectionValue(sortDirection: SortDirection): string {
        return sortDirection == SortDirection.Descending ? "descending" : "ascending"
    }

    createContextMenu(row: Object, mouseOverIdx: number, cs: XcTableColSpec) {
        let contextMenu = cs.actionSheetProvider != null ? cs.actionSheetProvider(row, cs.name) : null
        // update mouseOverIndex to -1 in order to trigger a render and close the context menu
        if (contextMenu != null) {
            contextMenu = (<XcContextMenu {... contextMenu.props}>
                {React.Children.map(contextMenu.props.children, (e, idx) => React.cloneElement(e, {key: idx, buttonAction: () => this.setState({mouseOverIndex: -1}, () => {e.props.buttonAction()} ) }))}
            </XcContextMenu>)
        }
        return contextMenu
    }
    
    columnContent(row: Object, cs: XcTableColSpec, mouseOverIdx: number, rowIdx: number, colIdx: number, colorStripeProvider: ?(Object, number) => string): Table.Cell {
        const icon = (cs.actionSheetProvider != null && mouseOverIdx == rowIdx) ? 
            <Popup flowing hoverable on="click" position="bottom left" trigger={<Icon name="ellipsis vertical" style={{ float: "right" }} />} >{this.createContextMenu(row, mouseOverIdx, cs)}</Popup> 
            : null
        const content = cs.formatter != null ? cs.formatter(row, cs.name) : row[cs.name]
        const cell = (colIdx == 0 && colorStripeProvider != null) ?
            <div style={{ borderLeft: `6px solid ${colorStripeProvider(row, rowIdx)}` }}>&nbsp;&nbsp;{content}{icon}</div>
            :
            (icon != null ? <div>{content}{icon}</div> : content)
        return <Table.Cell key={colIdx} width={cs.width} {...cs.horizontalAlign ? { textAlign: cs.horizontalAlign.value } : {}}>{cell}</Table.Cell>
    }
}
