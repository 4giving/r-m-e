import { EditorState } from 'prosemirror-state';

import baseDictionary from '../dictionary';
import isInList from '../queries/isInList';
import isMarkActive from '../queries/isMarkActive';
import isNodeActive from '../queries/isNodeActive';
import { MenuItem } from '../types';
import BoldIcon from './icons/bold';
import BulletListIcon from './icons/bulletList';
import HeadingOne from './icons/headingOne';
import HeadingTwo from './icons/headingTwo';
import HorizontalRuleIcon from './icons/hz';
import ImageIcon from './icons/image';
import ItalicIcon from './icons/italic';
import LinkIcon from './icons/link';
import OrderedListIcon from './icons/orderedList';
import QuoteIcon from './icons/quote';

export default function formattingMenuItems(state: EditorState, dictionary: typeof baseDictionary): MenuItem[] {
	const { schema } = state;
	const isList = isInList(state);
	const allowBlocks = !isList;

	return [
		{
			name: 'strong',
			tooltip: dictionary.strong,
			icon: BoldIcon,
			active: isMarkActive(schema.marks.strong)
		},
		{
			name: 'em',
			tooltip: dictionary.em,
			icon: ItalicIcon,
			active: isMarkActive(schema.marks.em)
		},
		{
			name: 'heading',
			tooltip: dictionary.heading,
			icon: HeadingOne,
			active: isNodeActive(schema.nodes.heading, { level: 1 }),
			attrs: { level: 1 },
			visible: allowBlocks
		},
		{
			name: 'heading',
			tooltip: dictionary.subheading,
			icon: HeadingTwo,
			active: isNodeActive(schema.nodes.heading, { level: 2 }),
			attrs: { level: 2 },
			visible: allowBlocks
		},
		{
			name: 'blockquote',
			tooltip: dictionary.quote,
			icon: QuoteIcon,
			active: isNodeActive(schema.nodes.blockquote),
			attrs: { level: 2 },
			visible: allowBlocks
		},
		{
			name: 'link',
			tooltip: dictionary.createLink,
			icon: LinkIcon,
			active: isMarkActive(schema.marks.link),
			attrs: { href: '' }
		},
		{
			name: 'hr',
			title: dictionary.hr,
			icon: HorizontalRuleIcon
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
			name: 'image',
			title: dictionary.image,
			icon: ImageIcon,
			keywords: 'picture photo'
		}
	];
}
