// @flow
import {Enum} from 'enumify';

export class BuySell extends Enum {}
BuySell.initEnum({ Buy: { value: 'B' }, Sell: { value: 'S' } });

export class LotNature extends Enum {}
LotNature.initEnum({ Board: { value: 'BRD' }, Odd: { value: 'ODD' } });

export class OrderStatus extends Enum { }
OrderStatus.initEnum({
    Pending: { value: 'PDN' }, New: { value: 'NEW' }, Reserved: { value: 'RD' }, WaitForApprove: { value: 'WA' },
    Rejected: { value: 'REJ' }, Cancelled: { value: 'CAN' }, Queued: { value: 'Q' }, PartialExecuted: { value: 'PEX' }, FullyExecuted: { value: 'FEX' }
});
