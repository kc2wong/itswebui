export type XcInputTextConstraint = {
    minLength: ?number,
    maxLength: ?number,
    required: ?bool
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