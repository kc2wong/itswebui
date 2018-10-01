//@flow
import { Enum } from 'enumify'

export class IconPosition extends Enum {}
IconPosition.initEnum({ Left: { value: 'left' }, Right: { value: 'right' } });

export type XcIconProps = {
    name: string,
    position: ?IconPosition,
    onIconClick?: () => void
}
