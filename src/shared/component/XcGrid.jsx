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
    horizontalAlign?: HorizontalAlign,
    width?: number,
    children: React.ChildrenArray<XcGridCol>
}

type XcColState = {

}

const DEFAULT_COL_WIDTH = 16

class XcGridCol extends React.Component<XcColProps, XcColState> {

    render() {
        const { horizontalAlign, ...props } = this.props
        const width = this.getEvenly(props) ? {} : { width: this.getWidth() }
        const ta = horizontalAlign != null ? {textAlign: horizontalAlign.value} : {}
        return (
            <Grid.Column {...width} {...ta}>{this.props.children}</Grid.Column>
        )
    }

    getWidth = (): number => {
        const width = this.props.width;
        return width != null ? width : DEFAULT_COL_WIDTH;
    }

    getEvenly = (props: Object): boolean => {
        return parseBool(props.evenly, false)
    }

}


type XcRowProps = {
    verticalAlign?: VerticalAlign,
    children: React.ChildrenArray<any>
}

type XcRowState = {

}

class XcGridRow extends React.Component<XcRowProps, XcRowState> {
    render() {
        const { verticalAlign, ...props } = this.props
        const e = this.getEvenly(props) == true ? { evenly: true } : {}
        const style=this.getStyle(this.props)
        return (
            <Grid.Row verticalAlign={(verticalAlign ? verticalAlign : VerticalAlign.Middle).value} {...style}>
                {React.Children.map(this.props.children, child => child != null ? React.cloneElement(child, e) : child)}
            </Grid.Row>
        )
    }


    getEvenly = (props: Object): boolean => {
        return parseBool(props.evenly, false)
    }

    getStyle = (props: Object): Object => {
        return props.style ? {style: props.style} : {}
    }

}    


type XcGridProps = {
    columns?: number,
    evenly?: bool,
    rowStyle?: Object,
    showDivider?: bool,
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
        const { columns, evenly, rowStyle, showDivider, verticalAlign, ...props } = this.props
        const va = verticalAlign != null ? { verticalAlign: verticalAlign.value } : {}
        const d = parseBool(showDivider, false) == true ? { divided: true } : {}
        const e = parseBool(evenly, false) == true ? { evenly: true } : {}
        const rs = rowStyle ? { style: rowStyle } : {}
        
        const rowExtraProps = this.getRowExtraProps(this.props)
        
        return (
            <Grid {...this.getColumns(columns, evenly)} {...d} {...props} {...va} {...rs} >
                {React.Children.map(this.props.children, child => child != null ? React.cloneElement(child, rowExtraProps) : child)}
            </Grid>
        )
    }

    getRowExtraProps = (props: Object): Object => {
        let rtn = {}
        if (parseBool(props.evenly, false) == true) {
            rtn = Object.assign(rtn, { evenly: true })
        }
        if (props.rowStyle != null) {
            rtn = Object.assign(rtn, { style: props.rowStyle })
        }
        return rtn
    }

    getColumns = (columns: ?number, evenly: ?bool): Object => {
        return parseBool(evenly, false) == true ? {columns: 'equal'} : {columns: columns != null ? columns : DEFAULT_COL_WIDTH};
    }

}