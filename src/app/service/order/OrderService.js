// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { OrderInputResourceBundle, OrderRequest, SimpleOrder } from 'app/model/order/'
import { httpGet, httpPost } from 'shared/util/networkUtil';

const eApiContextPath = `${SERVER_API_URL}/eapi/order/order-request-bundles`
const contextPath = `${SERVER_API_URL}/papi/orders`

class OrderService {

    getOrderInputResourceBundle(id: Object): Promise<OrderInputResourceBundle> {
        let url = `${eApiContextPath}/exchanges/${id.exchangeCode}/instruments/${id.instrumentCode}`
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return OrderInputResourceBundle.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

    calculateChargeCommission(orderRequest: OrderRequest): Promise<SimpleOrder> {
        let url = `${contextPath}/simulations`
        return httpPost(url, null, orderRequest).then(
            msg => {
                const json = msg.json
                return SimpleOrder.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

}

export const orderService = new OrderService();
