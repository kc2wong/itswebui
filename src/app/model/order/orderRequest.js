export class OrderRequest {
    buySell: string;
    caccOid: string;
    exchangeOid: string;
    instrumentOid: string;
    quantity: number;
    price: number;

    constructor(buySell: string, caccOid: string, exchangeOid: string, instrumentOid: string, quantity: number, price: number) {
        this.buySell = buySell
        this.caccOid = caccOid
        this.exchangeOid = exchangeOid
        this.instrumentOid = instrumentOid
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