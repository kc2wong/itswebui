// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { StaticDataService } from './StaticDataService';
import { Exchange } from 'app/model/staticdata';
import { Pageable, PageResult, SortOrder } from 'shared/model';
import { handleJsonResponse, httpGet } from 'shared/util/networkUtil';
import { parseBool } from 'shared/util/lang';

const contextPath = `${SERVER_API_URL}/sapi/static-data/exchanges`

class ExchangeService implements StaticDataService<Exchange> {

    create(data: Exchange): Exchange {
        return data;
    }

    delete(id: Object): void {

    }

    getOne(id: Object): Promise<Exchange> {
        let url = contextPath
        _.forEach(Object.values(id), v => {
            url = url + `/${v}`
        })
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return Exchange.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

    getPage(pageable: ?Pageable, criteria: Object): Promise<PageResult<Exchange>> {
        const sort = ( pageable && pageable.sortBy && pageable.sortDirection ) ? {sort: `${pageable.sortBy},${pageable.sortDirection.value}`} : {} 
        const param = Object.assign(pageable ? {page: pageable.pageNumber - 1, size: pageable.pageSize} : {}, criteria, sort)   // pageNumber starts with 0 in server side
        return httpGet(`${contextPath}`, param).then(
            msg => {
                const json = msg.json
                const data = _.map(json.content, (d) =>
                    Exchange.fromJson(d)
                );
                const rtn = Promise.resolve(new PageResult(criteria, json.currentPage + 1, json.pageSize, json.totalPage, json.totalCount, data));
                return rtn
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }
        )
    }

    update(data: Exchange): Exchange {
        return data
    }

}

export const exchangeService = new ExchangeService();
