import { mdiLink } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function LinkIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiLink} />
		</Icon>
	);
}
