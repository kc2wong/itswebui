// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { TradingAccountPortfolioBundle } from 'app/model/client'
import { httpGet } from 'shared/util/networkUtil';

const eApiContextPath = `${SERVER_API_URL}/eapi/trading-accounts`
const contextPath = `${SERVER_API_URL}/papi/trading-accounts`

class TradingAccountService {

    getAccountPortfolio(tradingAccountCode: string, baseCurrencyCode: string): Promise<TradingAccountPortfolioBundle> {
        let url = `${eApiContextPath}/${tradingAccountCode}/portfolios/${baseCurrencyCode}`
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
