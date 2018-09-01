// @flow
import _ from 'lodash'
import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { Enum } from 'enumify';
import { parseBool, xlate } from 'shared/util/lang';

import './XcGrid.css';

class VerticalAlign extends Enum {}
VerticalAlign.initEnum({ Bottom: { value: 'bottom' }, Middle: { value: 'middle' }, Top: { value: 'top' } });

class HorizontalAlign extends Enum {}
HorizontalAlign.initEnum({ Left: { value: 'left' }, Center: { value: 'center' }, Right: { value: 'right' } });

type XcColProps = {
    evenly: ?bool,
    horizontalAlign: ?HorizontalAlign,
    children: React.ChildrenArray<XcGridCol>,
    width: ?number
}

type XcColState = {

}

const DEFAULT_COL_WIDTH = 16

class XcGridCol extends React.Component<XcColProps, XcColState> {

    render() {
        const { evenly, horizontalAlign } = this.props
        const width = evenly ? {} : { width: this.getWidth() }
        const ta = horizontalAlign != null ? {textAlign: horizontalAlign.value} : {}
        return (
            <Grid.Column {...width} {...ta}>{this.props.children}</Grid.Column>
        )
    }

    getWidth = (): number => {
        const width = this.props.width;
        return width != null ? width : DEFAULT_COL_WIDTH;
    }
}


type XcRowProps = {
    evenly: ?bool,
    verticalAlign?: VerticalAlign,
    children: React.ChildrenArray<any>
}

type XcRowState = {

}

class XcGridRow extends React.Component<XcRowProps, XcRowState> {
    render() {
        const { evenly, verticalAlign, ...props } = this.props
        return (
            <Grid.Row verticalAlign={(verticalAlign ? verticalAlign : VerticalAlign.Middle).value} {...props}>
                {React.Children.map(this.props.children, child => child != null ? React.cloneElement(child, { evenly: evenly }) : child)}
            </Grid.Row>
        )
    }
}    


type XcGridProps = {
    columns: ?number,
    divider: ?bool,
    evenly: ?bool,
    verticalAlign?: VerticalAlign,
    children: React.ChildrenArray<any>
}

type XcGridState = {

}

export class XcGrid extends React.Component<XcGridProps, XcGridState> {
    static Row = XcGridRow;
    static Col = XcGridCol;
    static VerticalAlign = VerticalAlign
    static HorizontalAlign = HorizontalAlign

    render() {
        const { columns, divider, evenly, verticalAlign, ...props } = this.props
        const va = verticalAlign != null ? { verticalAlign: verticalAlign.value } : {}
        const d = parseBool(divider, false) == true ? { divided: true } : {}
        const e = parseBool(evenly, false) == true ? { evenly: true } : {}
        return (
            <Grid {...this.getColumns(columns, evenly)} {...d} {...props} {...va} >
                {React.Children.map(this.props.children, child => child != null ? React.cloneElement(child, { evenly: evenly }) : child)}
            </Grid>
        )
    }

    getColumns = (columns: ?number, evenly: ?bool): Object => {
        return parseBool(evenly, false) == true ? {columns: 'equal'} : {columns: columns != null ? columns : DEFAULT_COL_WIDTH};
    }

}