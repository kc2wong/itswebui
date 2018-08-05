// @flow
import * as React from 'react';
// import { Col, Grid, Row } from 'react-bootstrap';
import { Grid } from 'semantic-ui-react';
import { Enum } from 'enumify';
import { parseBool, xlate } from 'shared/util/lang';

import './XcGrid.css';

class VerticalAlign extends Enum {}
VerticalAlign.initEnum({ Bottom: { value: 'bottom' }, Middle: { value: 'middle' }, Top: { value: 'top' } });

type XcColProps = {
    alignRight: ?bool,
    children: React.ChildrenArray<XcGridCol>,
    width: ?number
}

type XcColState = {

}

const DEFAULT_COL_WIDTH = 16

class XcGridCol extends React.Component<XcColProps, XcColState> {

    render() {
        const width = this.getWidth()
        const ta = parseBool(this.props.alignRight) ? {textAlign: 'right'} : {}
        return (
            <Grid.Column width={width} {...ta}>{this.props.children}</Grid.Column>
        )
    }

    getWidth = (): number => {
        const width = this.props.width;
        return width != null ? width : DEFAULT_COL_WIDTH;
    }
}


type XcRowProps = {
    children: React.ChildrenArray<XcGridCol>
}

type XcRowState = {

}

class XcGridRow extends React.Component<XcRowProps, XcRowState> {
    render() {
        const { ...props } = this.props
        return (
            <Grid.Row columns={DEFAULT_COL_WIDTH} verticalAlign='middle' {...props}>{this.props.children}</Grid.Row>
        )
    }
}    


type XcGridProps = {
    verticalAlign?: VerticalAlign,
    children: React.ChildrenArray<XcGridRow>
}

type XcGridState = {

}

export class XcGrid extends React.Component<XcGridProps, XcGridState> {
    static Row = XcGridRow;
    static Col = XcGridCol;
    static VerticalAlign = VerticalAlign

    render() {
        const { verticalAlign, ...props } = this.props
        const va = verticalAlign != null ? { verticalAlign: verticalAlign.value} : {}
        return (
            <Grid columns={DEFAULT_COL_WIDTH} {...props} {...va} >
                {this.props.children}
            </Grid>
        )
    }
}