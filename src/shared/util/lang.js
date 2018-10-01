// @flow

import _ from 'lodash';
import T from 'i18n-react';
import { Enum } from 'enumify';
import numeral from 'numeral'

export class Language extends Enum { }
Language.initEnum({ English: { value: 'en' }, TraditionalChinese: { value: 'zh' }, SimplifiedChinese: { value: 'gb' } });

export function parseBool(v: any, defaultValue?: boolean = false): boolean {
    if (!_.isUndefined(v) && !_.isNull(v)) {
        if (_.isBoolean(v)) {
            return v;
        }
        else if (_.isString(v)) {
            return "true" === (v: string).toLowerCase();
        }
    }
    return defaultValue;
}

export function nvl(v: ?T, defaultValue: T): T {
    return v != null ? v : defaultValue;
}

export function setLanguage(language: Language) {
    T.setTexts(require(`./../../../assets/i18n/${language.value}.json`));
}

export function xlate(value: string, param?: Array<string> | Object): string {
    return T.translate(value, param);
}

export function createNumberFormat(thousandSeparator: boolean, decimalPoint: number): string {
    return (parseBool(thousandSeparator, true) == true ? '0,0.' : (decimalPoint > 0 ? '0.' : '0')) + _.repeat('0', decimalPoint);
}

export function formatNumber(value: number | string, format: string): string {
    if (typeof value === 'number') {
        return numeral(value).format(format);
    } else {
        const num = new Number(value)
        return _.isNaN(num) ? value : numeral(num).format(format);
    }
}

export function roundNumber(value: number, decimalPlace: number): number {
    return Number.parseFloat(value.toFixed(decimalPlace))
}

export function removeNull(obj: Object): Object {
    // Object.keys(obj).forEach((k) => (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    Object.keys(obj).forEach((k) => (obj[k] == null) && delete obj[k]);
    return obj;
}