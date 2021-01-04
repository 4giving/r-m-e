import { mdiClose } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function CloseIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiClose} />
		</Icon>
	);
}
