// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { ChargeCommission, OrderInputResourceBundle, Order, OrderCancelRequest, OrderRequest } from 'app/model/order/'
import { httpGet, httpPatch, httpPost } from 'shared/util/networkUtil';

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

    calculateChargeCommission(orderRequest: OrderRequest): Promise<ChargeCommission> {
        let url = `${contextPath}/simulations`
        return httpPost(url, null, orderRequest).then(
            msg => {
                const json = msg.json
                return ChargeCommission.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

    enquireOrder(orderNumber: string): Promise<Order> {
        let url = `${contextPath}/${orderNumber}`
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return Order.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

    cancelOrder(orderCancelRequest: OrderCancelRequest): Promise<Order> {
        let url = `${contextPath}/${orderCancelRequest.orderNumber}`
        return httpPatch(url, null, orderCancelRequest).then(
            msg => {
                const json = msg.json
                return Order.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }

}

export const orderService = new OrderService();
