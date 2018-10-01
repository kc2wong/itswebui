// @flow
import { Enum } from 'enumify';
import { Language } from 'shared/util/lang';

export class SortDirection extends Enum { }
SortDirection.initEnum({ Ascending: { value: 'asc' }, Descending: { value: 'desc' } });

export interface BaseModel {
    getId(): Object;
    toJson(): Object;
}

export interface MultiLingual {
    getDescription(language: Language): string
}

export class Pageable {
    pageNumber: number;
    pageSize: number;
    sortBy: ?string;
    sortDirection: ?SortDirection;

    constructor(pageNumber: number, pageSize: number, sortBy: ?string = null, sortDirection: ?SortDirection = null) {
        this.pageNumber = pageNumber
        this.pageSize = pageSize
        this.sortBy = sortBy
        this.sortDirection = sortDirection
    }
}

export class PageResult<T> {
    criteria: Object;
    currentPage: number;
    totalCount: number;    
    totalPage: number;
    pageSize: number;
    hasNext: boolean;
    data: T[];

    constructor(criteria: Object, currentPage: number, pageSize: number, totalPage: number, totalCount: number, hasNext: boolean, data: T[]) {
        this.criteria = criteria
        this.currentPage = currentPage
        this.totalPage = totalPage
        this.totalCount = totalCount
        this.pageSize = pageSize
        this.hasNext = hasNext
        this.data = data
    }

    // hasNextPage(): boolean {
    //     return this.hasNext
    // }
}