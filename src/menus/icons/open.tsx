import { mdiOpenInNew } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function OpenIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiOpenInNew} />
		</Icon>
	);
}
