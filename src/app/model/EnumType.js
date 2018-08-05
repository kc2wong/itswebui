// @flow
import {Enum} from 'enumify';

export class BuySell extends Enum {}
BuySell.initEnum({ Buy: { value: 'B' }, Sell: { value: 'S' } });
