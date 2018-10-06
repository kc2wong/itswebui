// @flow
import _ from 'lodash'
import type { FormContextType } from './XcForm'
import { defaultFormContext } from './XcForm'
import { parseBool, xlate } from 'shared/util/lang'
import { formatDate } from 'shared/util/dateUtil'
import { IFieldConstraint } from './validation/XcFieldConstraint'

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

export function getStringValue (value: ?any, model: any, name: string, defaultValue?: string = ""): string {
    // const v = value != null ? value : (model[name]: string|number|Date) ;
    const v = value != null ? value : model[name]
    if (_.isDate(v)) {
        return formatDate((v: Date))
    }
    else {
        switch (typeof v) {
            case 'number':
                return v.toString();
            default:
                return v != null ? v.toString() : defaultValue;
        }    
    }
}

export function getFormContext(props: Object): FormContextType {
    const rtn = (props.context: FormContextType)
    return rtn != null ? rtn : defaultFormContext
}