// @flow
import moment from 'moment-es6';
import { nvl } from './lang';
import { ErrorCode } from '../constant/ErrorCode';
import { getAuthenticationToken } from './sessionUtil';
import { DATE_FORMAT, DATETIME_FORMAT, formatDate, formatDateTime } from 'shared/util/dateUtil'
import { removeNull } from 'shared/util/lang'

export const AUTHENTICATION_TOKEN_HEADER = 'authenticationToken'

const DEFAULT_TIMEOUT = 5000;

const dateFormatRegularExp = /^\d{4}-\d{2}-\d{2}$/
const dateTimeFormatRegularExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

function dateHandler(key: string, value: any): any {
    if (typeof value === "string" && key != 'syncstr') {
        if (dateTimeFormatRegularExp.test(value)) {
            return moment(value, DATETIME_FORMAT).toDate()
        }
        else if (dateFormatRegularExp.test(value)) {
            return moment(value, DATE_FORMAT).toDate()
        }
    }
    return value;
}

function getQueryString(params: Object, extraQueryParam: ?string) {
    const esc = encodeURIComponent;
    const base = Object.keys(removeNull(params))
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    if (extraQueryParam) {
        return base + '&' + extraQueryParam;
    }
    else {
        return base;
    }
}

function timeoutPromise(value: number, error: Object) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(error);
        }, value);
    })
}

function request(contextPath: string, params: Object, timeout: number, extraQueryParam: ?string, rawResponse: ?bool = false) {
    const method = nvl(params.method, 'GET')
    const headers = nvl(params.headers, {})
    let qs:? string
    let body:? string

    if (['GET', 'DELETE'].indexOf(method) > -1) {
        // GET or DELETE
        qs = '?' + getQueryString(params.data ? params.data : {}, extraQueryParam);
    } else {
        // POST or PUT
        body = JSON.stringify(params.data);
    }
    const url = contextPath + nvl(qs, '')
    const timeoutErrorCode = ['DELETE', 'POST', 'PUT'].indexOf(method) > -1 ? ErrorCode.UPDATE_TIMEOUT : ErrorCode.ENQUIRY_TIMEOUT;
    // Only able to report a timeout but cannot cancel the submitted request
    return Promise.race([timeoutPromise(timeout, { errorCode: timeoutErrorCode }), fetch(url, { method, headers, body })]).then(
        resp => {
            return rawResponse ? resp : handleJsonResponse(resp)
        },
        error => {
            return Promise.reject({ errorCode: ErrorCode.SYSTEM_ERROR, errorParam: error })
        }
    )
}

export function httpGet(url: string, params: Object, timeout?: number, extraQueryParam: ?string, rawResponse?: bool = false) {
    return request(url, { headers: authHeaderForGet(), method: 'GET', data: params }, nvl(timeout, DEFAULT_TIMEOUT), extraQueryParam, rawResponse);
}

export function httpPatch(url: string, headers: ?Object, data: Object, timeout?: number, rawResponse: ?bool = false) {
    return request(url, { headers: headers ? headers : authHeaderForPost(), method: 'PATCH', data: data }, nvl(timeout, DEFAULT_TIMEOUT), null, rawResponse)
}

export function httpPost(url: string, headers: ?Object, data: Object, timeout?: number, rawResponse: ?bool = false) {
    return request(url, { headers: headers ? headers : authHeaderForPost(), method: 'POST', data: data }, nvl(timeout, DEFAULT_TIMEOUT), null, rawResponse)
}

export function handleJsonResponse(response: Response): Object {
    let message = null;
    return response.text().then(text => {
        if (!response.ok) {
            const errorCode = response.headers.get('X-its-errorCode');
            const errorParam = response.headers.get('X-its-errorParam');
            return Promise.reject({ errorCode: errorCode, errorParam: errorParam })
        }
        // TODO get alert from payload instead
        const headers = response.headers ? response.headers : {} 
        const code = headers.get('X-its-alert')
        const param = headers.get('X-its-params')
        const json = text.length > 0 ? JSON.parse(text, dateHandler) : {};
        if (code) {
            return Promise.resolve({ message: { code, param }, json });   // message code and param from header, json from body
        }
        else {
            return Promise.resolve({ json });
        }
    })
}

function authHeaderForGet(): Object {
    let jwt = getAuthenticationToken()
    if (jwt) {
        return { 'Authorization': `Bearer ${jwt}` };        
    }
    else {
        return {};        
    }
}

function authHeaderForPost(): Object {
    let jwt = getAuthenticationToken()
    if (jwt) {
        return { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json;charset=UTF-8' };        
    }
    else {
        return { 'Content-Type': 'application/json;charset=UTF-8' };        
    }
}