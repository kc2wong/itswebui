// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { TradingAccountPortfolioBundle } from 'app/model/client'
import { httpGet } from 'shared/util/networkUtil';

const contextPath = `${SERVER_API_URL}/account/v1`

class TradingAccountService {

    getAccountPortfolio(tradingAccountCode: string, baseCurrencyCode: string): Promise<TradingAccountPortfolioBundle> {
        let url = `${contextPath}/xapi/trading-accounts/${tradingAccountCode}/currencies/${baseCurrencyCode}/portfolios`
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json                
                return TradingAccountPortfolioBundle.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }
}

export const tradingAccountService = new TradingAccountService();
