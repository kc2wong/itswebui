// @flow
import moment from 'moment-es6';
import { nvl } from './lang';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function formatDate(value?: Date, pattern?: string) {
    return value != null ? moment(value).format(nvl(pattern, DATE_FORMAT)) : '' ;
}

export function formatDateTime(value?: Date, pattern?: string) {
    return value != null ? moment(value).format(nvl(pattern, DATETIME_FORMAT)) : '' ;
}