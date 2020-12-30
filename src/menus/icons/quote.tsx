import { mdiFormatQuoteClose } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function QutoeIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiFormatQuoteClose} />
		</Icon>
	);
}
