import { mdiFormatItalic } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function BoldIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiFormatItalic} />
		</Icon>
	);
}
