import { BlockQuoteIcon, Heading1Icon, Heading2Icon, HighlightIcon, InputIcon, LinkIcon } from 'outline-icons';
import { EditorState } from 'prosemirror-state';

import baseDictionary from '../dictionary';
import isInList from '../queries/isInList';
import isMarkActive from '../queries/isMarkActive';
import isNodeActive from '../queries/isNodeActive';
import { MenuItem } from '../types';
import BoldIcon from './icons/bold';
import ItalicIcon from './icons/italic';

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
			name: 'mark',
			tooltip: dictionary.mark,
			icon: HighlightIcon,
			active: isMarkActive(schema.marks.mark),
			visible: !isTemplate
		},
		{
			name: 'separator',
			visible: allowBlocks
		},
		{
			name: 'heading',
			tooltip: dictionary.heading,
			icon: Heading1Icon,
			active: isNodeActive(schema.nodes.heading, { level: 1 }),
			attrs: { level: 1 },
			visible: allowBlocks
		},
		{
			name: 'heading',
			tooltip: dictionary.subheading,
			icon: Heading2Icon,
			active: isNodeActive(schema.nodes.heading, { level: 2 }),
			attrs: { level: 2 },
			visible: allowBlocks
		},
		{
			name: 'blockquote',
			tooltip: dictionary.quote,
			icon: BlockQuoteIcon,
			active: isNodeActive(schema.nodes.blockquote),
			attrs: { level: 2 },
			visible: allowBlocks
		},
		{
			name: 'separator'
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
