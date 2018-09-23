// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { PriceQuote } from 'app/model/staticdata';
import { handleJsonResponse, httpGet } from 'shared/util/networkUtil';

const contextPath = `${SERVER_API_URL}/sapi/static-data/exchanges`

class PriceQuoteService {

    getOne(id: Object): Promise<PriceQuote> {
        let url = `${contextPath}/${id.exchangeCode}/instruments/${id.instrumentCode}/price-quotes`
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
