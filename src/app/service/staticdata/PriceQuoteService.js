// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { PriceQuote } from 'app/model/staticdata';
import { handleJsonResponse, httpGet } from 'shared/util/networkUtil';

const contextPath = `${SERVER_API_URL}/marketdata/v1/sapi`

class PriceQuoteService {

    getOne(id: Object): Promise<PriceQuote> {
        let url = `${contextPath}/exchanges/${id.exchangeCode}/instruments/${id.instrumentCode}/quotes`
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return PriceQuote.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }
}

export const priceQuoteService = new PriceQuoteService();
