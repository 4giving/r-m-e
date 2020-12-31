import { mdiFormatListBulleted } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function BulletListIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiFormatListBulleted} />
		</Icon>
	);
}
