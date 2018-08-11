export class OrderRequest {
    side: string;
    caccOid: string;
    exchangeCode: string;
    instrumentCode: string;
    quantity: number;
    price: number;

    constructor(side: string, caccOid: string, exchangeCode: string, instrumentCode: string, quantity: number, price: number) {
        this.side = side
        this.caccOid = caccOid
        this.exchangeCode = exchangeCode
        this.instrumentCode = instrumentCode
        this.quantity = quantity
        this.price = price
    }

    toJson(): Object {
        const rtn = {};
        Object.assign(rtn, this);
        return rtn        
    }
    
    static fromJson(json: Object): OrderRequest {
        const rtn = this.newInstance()
        Object.assign(rtn, json)
        return rtn
    }

    static newInstance(): OrderRequest {
        return new OrderRequest("","", "", "", 0, 0);
    }

}