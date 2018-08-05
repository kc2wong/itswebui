export interface IFieldConstraint {
    required: ?bool,    
}

export class XcInputTextConstraint implements IFieldConstraint {
    constructor(required: ?bool) {
        this.required = required;
    }
}

export class XcSelectConstraint implements IFieldConstraint {
    constructor(required: ?bool) {
        this.required = required;
    }
}