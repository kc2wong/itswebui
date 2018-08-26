// @flow

import _ from 'lodash';
import T from 'i18n-react';
import { Enum } from 'enumify';

export class Language extends Enum { }
Language.initEnum({ English: { value: 'en' }, TraditionalChinese: { value: 'zh' } });

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

export function formatNumber(value: number, thousandSeparator: boolean, decimalPlace: number): string {
    const v = new Number(value)
    return thousandSeparator ? v.toFixed(decimalPlace).replace(/(\d)(?=(\d{3})+\b)/g,'$1,') : v.toFixed(decimalPlace)
}