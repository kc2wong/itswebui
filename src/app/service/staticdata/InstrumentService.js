// @flow
import _ from 'lodash';
import { SERVER_API_URL } from 'app/constant/ApplicationConstant';
import { Instrument } from 'app/model/staticdata';
// import { Pageable, PageResult, SortOrder } from 'shared/model';
import { handleJsonResponse, httpGet } from 'shared/util/networkUtil';
import { parseBool } from 'shared/util/lang';

const contextPath = `${SERVER_API_URL}/staticdata/v1/sapi/exchanges`

class InstrumentService {

    getOne(id: Object): Promise<Instrument> {
        let url = `${contextPath}/${id.exchangeCode}/instruments/${id.instrumentCode}`
        return httpGet(url, {}).then(
            msg => {
                const json = msg.json
                return Instrument.fromJson(json)
            },
            error => {
                console.error(error)
                return Promise.reject(error)
            }        
        )
    }
}

export const instrumentService = new InstrumentService();
