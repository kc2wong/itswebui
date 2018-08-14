// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { OrderInputResourceBundle } from 'app/model/order/orderRequest';
import { httpGet } from 'shared/util/networkUtil';

const contextPath = `${SERVER_API_URL}/eapi/order/order-request-bundles`

class OrderService {

    getOrderInputResourceBundle(id: Object): Promise<OrderInputResourceBundle> {
        let url = `${contextPath}/exchanges/${id.exchangeCode}/instruments/${id.instrumentCode}`
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
}

export const orderService = new OrderService();
