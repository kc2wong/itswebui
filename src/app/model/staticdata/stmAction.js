// @flow
import {Enum} from 'enumify';
import { BaseModel } from 'shared/model/BaseModel';

export class FunctionCategory extends Enum {}
FunctionCategory.initEnum({ Instrument: { value: 'I' }, Client: { value: 'C' } });

export class StmActionType extends Enum {}
StmActionType.initEnum({ Information: { value: 'I' }, Rejection: { value: 'R' } });

export class StmAction implements BaseModel {
    stmActionOid: string;
    stmActionCode: string;
    descpt: string;
    functionCategory: string;
    stmActionType: string;

    constructor(stmActionCode: string, descpt: string, functionCategory: string, stmActionType: string) {
        this.stmActionOid = "";
        this.stmActionCode = stmActionCode;
        this.descpt = descpt;
        this.functionCategory = functionCategory;
        this.stmActionType = stmActionType;
    }

    getId(): Object {
        return {
            stmActionOid: this.stmActionOid
        }
    }
    
    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): StmAction {
        const rtn = new StmAction("", "", "", "");
        Object.assign(rtn, json);
        return rtn
    }

    static newInstance(): StmAction {
        return new StmAction("", "", "", "");        
    }

    static getId(json: Object): Object {
        return {
            stmActionOid: json.stmActionOid
        }        
    }
}