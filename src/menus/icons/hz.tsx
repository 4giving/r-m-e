import { mdiMinus } from '@mdi/js';
import React from 'react';

import Icon, { IconProps } from './icon';

export default function HorizontalRuleIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d={mdiMinus} />
		</Icon>
	);
}
