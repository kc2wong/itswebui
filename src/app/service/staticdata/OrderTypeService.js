// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { StaticDataService } from './StaticDataService';
import { OrderType } from 'app/model/staticdata';
import { Pageable, PageResult, SortOrder } from 'shared/model';
import { handleJsonResponse, httpGet } from 'shared/util/networkUtil';
import { parseBool } from 'shared/util/lang';

const contextPath = `${SERVER_API_URL}/staticdata/v1/sapi/order-types`

class OrderTypeService implements StaticDataService<OrderType> {

    create(data: OrderType): OrderType {
        return data;
    }

    delete(id: Object): void {

    }

    getOne(id: Object): Promise<OrderType> {
        let url = contextPath
        _.forEach(Object.values(id), v => {
            url = url + `/${v}`
        })
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return OrderType.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

    getPage(pageable: ?Pageable, criteria: Object): Promise<PageResult<OrderType>> {
        const sort = ( pageable && pageable.sortBy && pageable.sortDirection ) ? {sort: `${pageable.sortBy},${pageable.sortDirection.value}`} : {} 
        const param = Object.assign(pageable ? {page: pageable.pageNumber - 1, size: pageable.pageSize} : {}, criteria, sort)   // pageNumber starts with 0 in server side
        return httpGet(`${contextPath}`, param).then(
            msg => {
                const json = msg.json
                const data = _.map(json.content, (d) =>
                    OrderType.fromJson(d)
                );
                const rtn = Promise.resolve(new PageResult(criteria, json.currentPage + 1, json.pageSize, json.totalPage, json.totalCount, json.hasNext, data));
                return rtn
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }
        )
    }

    update(data: OrderType): OrderType {
        return data
    }

}

export const orderTypeService = new OrderTypeService();
