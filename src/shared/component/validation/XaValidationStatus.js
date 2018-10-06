// @flow
import { Enum } from 'enumify';

export class ValidationStatus extends Enum {}
ValidationStatus.initEnum(['NotValidate', 'ValidateSuccess', 'ValidateFail']);
