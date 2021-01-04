import { mdiFormatListNumbered } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function OrderedListIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiFormatListNumbered} />
		</Icon>
	);
}
