// @flow
import _ from 'lodash'
import * as React from 'react';
import PieChart from 'react-minimal-pie-chart'

class XaPieChartData {
    color: string;
    key: string;
    label: ?string;
    value: number;

    constructor(key: string, value: number, label: string, color: string) {
        this.key = key;
        this.label = label;
        this.color = color;
        this.value = value;
    }
}

type XaPieChartProps = {
    data: Array<XaPieChartData>,
    onMouseOut: (SyntheticEvent<>, Object) => void,
    onMouseOver: (SyntheticEvent<>, Object) => void
}

type XaPieChartState = {

}

export class XaPieChart extends React.Component<XaPieChartProps, XaPieChartState> {
    static Data = XaPieChartData;
 
    render() {
        const { data, onMouseOut, onMouseOver, ...props } = this.props
        const chartData = _.sortBy(_.map(data, (d) => Object.assign({key: d.key, value: d.value, color: d.color})), "key")

        return (
            <PieChart animate data={chartData} onMouseOut={onMouseOut} onMouseOver={onMouseOver} />
        )
    }

}