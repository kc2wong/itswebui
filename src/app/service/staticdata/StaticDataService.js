// @flow
import { PageResult, SortOrder } from 'shared/model';

export interface StaticDataService<T> {
    create(data: T): T;
    delete(id: Object): void;
    getOne(id: Object): Promise<T>;
    getPage(page: number, criteria: Object, sortOrder: Map<string, SortOrder>): Promise<PageResult<T>>;
    update(data: T): T;
}