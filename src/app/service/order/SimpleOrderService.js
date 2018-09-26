// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { OrderEnquirySearchResult, SimpleOrder } from 'app/model/order/'
import { httpGet, httpPost } from 'shared/util/networkUtil';
import { formatDate } from 'shared/util/dateUtil'

const contextPath = `${SERVER_API_URL}/xapi`

class SimplOrderService {

    enquireOrder(tradingAccountCode: string, exchangeCode: ?string, startTradeDate: ?Date, endTradeDate: ?Date, pageable: ?Pageable, sortOrder: ?Map<string, SortOrder>): Promise<OrderEnquirySearchResult> {
        let url = `${contextPath}/trading-accounts/${tradingAccountCode}/simple-orders`
        const paramData = { 
            exchangeCode: exchangeCode,
            startTradeDate: startTradeDate != null ? formatDate(startTradeDate) : null, 
            endTradeDate: endTradeDate != null ? formatDate(endTradeDate) : null 
        }
        return httpGet(url, paramData).then(
            msg => {
                const json = msg.json
                return OrderEnquirySearchResult.fromJson({tradingAccountCode: tradingAccountCode, exchangeCode: exchangeCode, startTradeDate: startTradeDate, endTradeDate: endTradeDate}, json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

}

export const simpleOrderService = new SimplOrderService();
