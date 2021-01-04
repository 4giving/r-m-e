import { mdiTrashCan } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function TrashIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiTrashCan} />
		</Icon>
	);
}
