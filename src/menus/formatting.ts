import { EditorState } from 'prosemirror-state';

import baseDictionary from '../dictionary';
import isInList from '../queries/isInList';
import isMarkActive from '../queries/isMarkActive';
import isNodeActive from '../queries/isNodeActive';
import { MenuItem } from '../types';
import BoldIcon from './icons/bold';
import HeadingOne from './icons/headingOne';
import HeadingThree from './icons/headingThree';
import HeadingTwo from './icons/headingTwo';
import ImageIcon from './icons/image';
import InputIcon from './icons/input';
import ItalicIcon from './icons/italic';
import LinkIcon from './icons/link';
import QuoteIcon from './icons/quote';

export default function formattingMenuItems(
	state: EditorState,
	isTemplate: boolean,
	dictionary: typeof baseDictionary
): MenuItem[] {
	const { schema } = state;
	const isList = isInList(state);
	const allowBlocks = !isList;

	return [
		{
			name: 'placeholder',
			tooltip: dictionary.placeholder,
			icon: InputIcon,
			active: isMarkActive(schema.marks.placeholder),
			visible: isTemplate
		},
		{
			name: 'separator',
			visible: isTemplate
		},
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
			name: 'separator',
			visible: allowBlocks
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
			name: 'heading',
			tooltip: dictionary.subheading,
			icon: HeadingThree,
			active: isNodeActive(schema.nodes.heading, { level: 3 }),
			attrs: { level: 3 },
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
			name: 'separator'
		},
		{
			name: 'image',
			tooltip: dictionary.addImage,
			icon: ImageIcon,
			active: isMarkActive(schema.marks.link),
			attrs: { href: '' }
		},
		{
			name: 'link',
			tooltip: dictionary.createLink,
			icon: LinkIcon,
			active: isMarkActive(schema.marks.link),
			attrs: { href: '' }
		}
	];
}
