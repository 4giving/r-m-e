import { mdiImageArea } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './Icon';

export default function ImageIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiImageArea} />
		</Icon>
	);
}
