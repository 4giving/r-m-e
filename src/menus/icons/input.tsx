import { mdiFormTextbox } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function InputIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiFormTextbox} />
		</Icon>
	);
}
