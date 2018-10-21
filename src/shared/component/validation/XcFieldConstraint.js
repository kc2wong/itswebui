export type XaInputNumberConstraint = {
    required?: bool,
    lessThan?: number,
    lessEqual?: number,
    greaterThan?: number,
    greaterEqual?: number,
    custom?: () => ?string
}

export type XcInputTextConstraint = {    
    required: ?bool,
    minLength?: number,
    maxLength?: number,
    custom?: () => ?string
}

export type XcSelectConstraint = {
    required: ?bool
}

export interface IFieldConstraint {
    required: ?bool,  
}

// export class XcSelectConstraint implements IFieldConstraint {
//     constructor(required: ?bool) {
//         this.required = required;
//     }
// }