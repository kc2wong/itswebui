// @flow
import {Enum} from 'enumify';

export class BuySell extends Enum {}
BuySell.initEnum({ Buy: { value: 'B' }, Sell: { value: 'S' } });

export class LotNature extends Enum {}
LotNature.initEnum({ Board: { value: 'BRD' }, Odd: { value: 'ODD' } });
