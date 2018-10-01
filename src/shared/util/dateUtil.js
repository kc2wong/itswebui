// @flow
import moment from 'moment-es6';
import { nvl } from './lang';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function currentDate(): Date {
    const date = currentDateTime()
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
}

export function currentDateTime(): Date {
    const date = new Date()
    return date
}

export function minDate(date1: Date, date2: Date): Date {
    return date1.getTime() < date2.getTime() ? date1 : date2
}

export function formatDate(value: ?Date, pattern: ?string): string {
    return value != null ? moment(value).format(nvl(pattern, DATE_FORMAT)) : '' ;
}

export function formatDateTime(value: ?Date, pattern: ?string): string {
    return value != null ? moment(value).format(nvl(pattern, DATETIME_FORMAT)) : '' ;
}

export function parseDate(value: ?string, pattern: ?string): ?Date {
    const rtn = value != null ? moment(value, nvl(pattern, DATE_FORMAT.replace(/[^A-Za-z]/g, ""))) : null 
    return rtn != null ? rtn.toDate() : null
}
