import { HorizontalRuleIcon, OrderedListIcon } from 'outline-icons';

import baseDictionary from '../dictionary';
import { MenuItem } from '../types';
import BulletListIcon from './icons/bulletList';
import HeadingOne from './icons/headingOne';
import HeadingTwo from './icons/headingTwo';
import ImageIcon from './icons/image';
import LinkIcon from './icons/link';
import QuoteIcon from './icons/quote';

const isMac = window.navigator.platform === 'MacIntel';
const mod = isMac ? '⌘' : 'ctrl';

export default function blockMenuItems(dictionary: typeof baseDictionary): MenuItem[] {
	return [
		{
			name: 'heading',
			title: dictionary.h1,
			keywords: 'h1 heading1 title',
			icon: HeadingOne,
			shortcut: '^ ⇧ 1',
			attrs: { level: 1 }
		},
		{
			name: 'heading',
			title: dictionary.h2,
			keywords: 'h2 heading2',
			icon: HeadingTwo,
			shortcut: '^ ⇧ 2',
			attrs: { level: 2 }
		},
		{
			name: 'bullet_list',
			title: dictionary.bulletList,
			icon: BulletListIcon,
			shortcut: '^ ⇧ 8'
		},
		{
			name: 'ordered_list',
			title: dictionary.orderedList,
			icon: OrderedListIcon,
			shortcut: '^ ⇧ 9'
		},
		{
			name: 'separator'
		},
		{
			name: 'blockquote',
			title: dictionary.quote,
			icon: QuoteIcon,
			shortcut: `${mod} ]`
		},
		{
			name: 'hr',
			title: dictionary.hr,
			icon: HorizontalRuleIcon,
			shortcut: `${mod} _`,
			keywords: 'horizontal rule break line'
		},
		{
			name: 'image',
			title: dictionary.image,
			icon: ImageIcon,
			keywords: 'picture photo'
		},
		{
			name: 'link',
			title: dictionary.link,
			icon: LinkIcon,
			shortcut: `${mod} k`,
			keywords: 'link url uri href'
		}
	];
}
