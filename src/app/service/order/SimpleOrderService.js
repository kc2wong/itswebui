// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { OrderEnquirySearchResult, SimpleOrder } from 'app/model/order/'
import { httpGet, httpPost } from 'shared/util/networkUtil';
import { formatDate } from 'shared/util/dateUtil'

const contextPath = `${SERVER_API_URL}/papi/simple-orders`

class SimplOrderService {

    enquireOrder(tradingAccountCode: string, exchangeCode: string, startTradeDate: ?Date, endTradeDate: ?Date): Promise<OrderEnquirySearchResult> {
        let url = `${contextPath}/trading-accounts/${tradingAccountCode}/exchanges/${exchangeCode}`
        const paramDate = { startTradeDate: startTradeDate != null ? formatDate(startTradeDate) : null, endTradeDate: endTradeDate != null ? formatDate(endTradeDate) : null }
        return httpGet(url, paramDate).then(
            msg => {
                const json = msg.json
                return OrderEnquirySearchResult.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

}

export const simpleOrderService = new SimplOrderService();
