// @flow
import {Enum} from 'enumify';

export class DataType extends Enum {}
DataType.initEnum(['String', 'Number', 'Date']);

export class Mode extends Enum {}
Mode.initEnum({ Edit: { value: 'edit' }, Enquiry: { value: 'enquiry' }, New: { value: 'new' }, View: { value: 'view' } });

export class SortOrder extends Enum { }
SortOrder.initEnum({ Asc: { value: 'asc' }, Desc: { value: 'desc' } });