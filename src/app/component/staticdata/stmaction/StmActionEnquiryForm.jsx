// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Toolbar } from 'app/component/common/Toolbar';
import { PAGE_SIZE_OPTION } from 'app/constant/ApplicationConstant';
import { StmAction } from 'app/model/staticdata';
import { stmActionService } from 'app/service';

import { XcButton, XcButtonGroup, XcForm, XcFormGroup, XcGrid, XcGridCol, XcGridRow, XcInputText } from 'shared/component';
import { XcOption, XcPagination, XcPanel, XcPanelBody, XcPanelFooter, XcSearchCriteriaSpec, XcSelect, XcTable, XcTableColSpec } from 'shared/component';
import { BaseModel, DataType, Pageable, PageResult, SortDirection } from 'shared/model';
import { xlate } from 'shared/util/lang';

type Props = {
    onClear: () => void,
    onSearch: (searchCriteria: Object, pageable: Pageable, reverseOnly: ?bool) => ?Promise<PageResult<StmAction>>,
    onRecordSelect: (stmAction: StmAction) => void,
    selectedIndex: ?number,
    searchResult: ?PageResult<StmAction>
}

type State = {
    pageNum: number,
    pageSize: number,
    searchCriteria: Object,
    searchResultColSpec: XcTableColSpec[],
    sortBy: string,
    sortDirection: SortDirection
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

const PAGE_SIZE_OPT = _.sortBy(PAGE_SIZE_OPTION)

export class StmActionEnquiryForm extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = this.resetState();
    }

    render() {
        const { selectedIndex, searchResult } = this.props;
        const { pageNum, pageSize, searchResultColSpec } = this.state;
        const numOfRecord = searchResult != null ? searchResult.totalCount : 0;

        const dpOpt = _.map(_.range(4), (i) => {
            return new XcOption(`${i}`, `${i}`)
        });

        const criteriaStmActionCode = new XcSearchCriteriaSpec("#stmActionEditForm.stmActionCode", "stmActionCode", 3);
        const criteriaDescpt = new XcSearchCriteriaSpec("#stmActionEditForm.descpt", "descpt", 9);
        const searchCriteria = [[criteriaStmActionCode, criteriaDescpt]];

        return (
            <XcForm model={this.state.searchCriteria} name="stmActionEnquiryForm" onSubmit={this.handleSearch} >
                {_.map(searchCriteria, (row, rowIdx) => (
                    <XcFormGroup key={rowIdx}>
                        {_.map(row, (col, colIdx) => (
                            <XcInputText key={colIdx} label={col.label} name={col.name} width={col.width} />
                        ))}
                    </XcFormGroup>
                ))}
                <XcButtonGroup>
                    <XcButton label="#general.search" primary />
                    <XcButton label="#general.clear" onClick={this.handleClearForm} />
                </XcButtonGroup>
                {searchResult != null && (
                    <XcPanel>
                        <XcPanel.Header>{xlate("general.searchResult")}</XcPanel.Header>
                        <XcPanel.Body>
                            <XcTable colspec={searchResultColSpec} 
                                data={searchResult.data} 
                                onSort={this.handleSort} 
                                onSelectionChange={this.handleSelectionChange} 
                                selectedIndex={selectedIndex} 
                                size={XcTable.Size.Small} />
                        </XcPanel.Body>
                        <XcPanel.Footer>
                            <XcGrid>
                                <XcGrid.Row>
                                    <XcGrid.Col width={8}>
                                        <XcPagination activePage={pageNum} onPageChange={this.handleUpdatePageNum} totalPages={searchResult.totalPage} />
                                    </XcGrid.Col>
                                    <XcGrid.Col alignRight={true} width={4}>
                                        {xlate("general.pageSize")}&emsp;
                                        <XcPagination activePage={pageSize} onPageChange={this.handleUpdatePageSize} showNavigation={false} range={PAGE_SIZE_OPT} />
                                    </XcGrid.Col>
                                    <XcGrid.Col alignRight={true} width={3}>
                                        {xlate("general.noOfMatchRecord", [numOfRecord.toString()])}
                                    </XcGrid.Col>
                                </XcGrid.Row>
                            </XcGrid>
                        </XcPanel.Footer>
                    </XcPanel>
                )}
            </XcForm>
        )
    }

    handleClearForm = (event: SyntheticMouseEvent<>) => {
        this.setState(this.resetState(), () => {
            this.props.onClear()
        })
    }

    handleSearch = (event: SyntheticMouseEvent<>) => {
        const { pageNum, pageSize } = this.state
        this.search(pageNum, pageSize)
    }

    handleSort = (sortBy: string, sortDirection : SortDirection) => {
        const { pageNum, pageSize } = this.state
        const currentSortBy = this.state.sortBy
        const currentSortDirection = this.state.sortDirection
        const pageable = new Pageable(pageNum, pageSize, sortBy, sortDirection)
        const reverseOnly = sortBy == currentSortBy && sortDirection != currentSortDirection

        const promise = this.props.onSearch(this.state.searchCriteria.toJson(), pageable, reverseOnly)
        if (promise) {
            promise.then(
                result => {
                    const searchResultColSpec = this.createResultColSpec(sortBy, sortDirection)
                    this.setState({ pageNum: result.currentPage, pageSize: result.pageSize, searchResultColSpec: searchResultColSpec, sortBy: sortBy, sortDirection: sortDirection })
                },
                error => {
                    // TODO                
                }
            )
        }
    }

    handleSelectionChange = (index: number) => {
        const { onRecordSelect, searchResult } = this.props
        if (searchResult != null) {
            onRecordSelect(searchResult.data[index])
        }
    }

    handleUpdatePageNum = (pageNum: number) => {
        const { pageSize } = this.state
        this.search(pageNum, pageSize)
    }
    
    handleUpdatePageSize = (pageSize: number) => (event: SyntheticMouseEvent<>) => {
        const { pageNum } = this.state
        this.search(pageNum, pageSize)
    }

    search = (pageNum: number, pageSize: number) => {
        const { sortBy, sortDirection } = this.state
        const pageable = new Pageable(pageNum, pageSize, sortBy, sortDirection)
        const promise = this.props.onSearch(this.state.searchCriteria.toJson(), pageable)
        if (promise) {
            promise.then(
                result => {
                    this.setState({ pageNum: result.currentPage, pageSize: result.pageSize })
                },
                error => {
                    // TODO                
                }
            )    
        }
    }

    resetState = (): Object => {
        const searchResultColSpec = this.createResultColSpec("stmActionCode", SortDirection.Ascending)
        return {
            pageNum: 1,
            pageSize: PAGE_SIZE_OPTION[0],
            searchCriteria: new SearchCriteria(),
            searchResultColSpec: searchResultColSpec,
            sortBy: searchResultColSpec[0].name,
            sortDirection: searchResultColSpec[0].sortDirection
        }
    }

    createResultColSpec = (sortBy: string, sortDirection: SortDirection): XcTableColSpec[] => {
        const resultColName = ["stmActionCode", "descpt", "functionCategory", "stmActionType"]
        const resultColDataType = [DataType.String, DataType.String, DataType.String, DataType.String]
        const resultColLength = [3, 7, 3, 3]
        return _.map(resultColName, (c, idx) => {
            return new XcTableColSpec(c, resultColDataType[idx], xlate(`stmActionEditForm.${c}`), resultColLength[idx], sortBy == c ? sortDirection : null)
        })
    }
}
