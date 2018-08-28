// @flow
import { parseBool, xlate } from 'shared/util/lang';
import { IFieldConstraint } from './validation/XcFieldConstraint';

const DEFAULT_COL_NUM = 12;

export function constructLabel (formName: string, fieldName: string, label?: string, subLabel?: string): string {
    let mainLabel = label != null ? (label.startsWith('#') ? xlate(label.substr(1)) : label) : xlate(`${formName}.${fieldName}`);
    if (formName == null) {
        mainLabel = mainLabel + "&nbsp;&nbsp;&nbsp;&nbsp;"
    }
    return subLabel ? `${mainLabel} <span>${subLabel}</span>` : mainLabel
}

export function createColumnClass ( width: ?number = 12): string {
    const w: number = width != null ? width: DEFAULT_COL_NUM;
    return `col-lg-${w.toString()}`
}

export function getRequired(constraint: ?IFieldConstraint): bool {
    const defaultRequired = false;
    return constraint != null ? parseBool(constraint.required, defaultRequired) : defaultRequired;
}

export function getStringValue (value: ?string, model: any, name: string, defaultValue: ?string = ""): ?string {
    const v = value != null ? value : (model[name]: string) ;
    console.log(`XcFormUtil.getStringValue(), ${name} = ${v}, type = ${typeof v}`)
    switch (typeof v) {
        case 'number':
            return v.toString();
        default:
            return v != null ? v.toString() : defaultValue;
    }
}

