// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { SimpleOrder } from 'app/model/order/'
import { httpGet, httpPost } from 'shared/util/networkUtil';

const contextPath = `${SERVER_API_URL}/sapi/simple-orders`

class SimplOrderService {

    enquireOrder(tradingAccountCode: string, exchangeCode: string, startTradeDate: ?Date, endTradeDate: ?Date): Promise<[SimpleOrder]> {
        let url = `${contextPath}/trading-accounts/${tradingAccountCode}/exchanges/${exchangeCode}?`
        if (startTradeDate != null) {
            url = url + `startTradeDate=${startTradeDate.toString()}&`
        }
        if (endTradeDate != null) {
            url = url + `endTradeDate=${endTradeDate.toString()}&`
        }
        url = url.substr(0, url.length - 1)
        console.log(url)
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return _.map(json, d => SimpleOrder.fromJson(d))
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

}

export const orderService = new SimplOrderService();
