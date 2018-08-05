// @flow
import _ from 'lodash';
import * as React from 'react';
import { XcButton, XcButtonGroup, XcForm, XcFormGroup, XcInputText, XcTable, XcTableCol } from './';
import { constructLabel, getRequired, getStringValue } from './XcFormUtil';
import { BaseModel, DataType } from 'shared/model';
import { parseBool, xlate } from 'shared/util/lang';

type XcSearchResultColumnSpecProps = {
    label: ?string,
    name: string,
    width?: number
}

export class XcSearchResultColumnSpec extends React.Component<XcSearchResultColumnSpecProps, {}> {
    static defaultProps = {
        width: 12
    };
}


export class XcSearchCriteriaSpec {
    label: string;
    name: string;
    width: ?number;

    constructor(label: string, name: string, width: ?number = 12) {
        this.label = label;
        this.name = name;
        this.width = width;
    }
}

export class XcSearchResultSpec {
    dataType: DataType;
    label: string;
    name: string;
    width: number;

    constructor(dataType: DataType, label: string, name: string, width: number = 12) {
        this.dataType = dataType;
        this.label = label;
        this.name = name;
        this.width = width;
    }
}

type XcSearchTableProps = {
    criteria: XcSearchCriteriaSpec[][],
    name: string,
    children: ?React.Node,
    resultSpec: XcTableCol[]
}

type XcSearchTableState = {
    model: Object,
    result: Array<Object>
}

class SearchCriteria implements BaseModel {
    data: Object;

    constructor() {
        this.data = {};
    }

    toJson(): Object {
        return this.data;
    }
}
