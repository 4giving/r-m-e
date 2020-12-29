import { mdiFormatQuoteClose } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './Icon';

export default function QutoeIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiFormatQuoteClose} />
		</Icon>
	);
}
