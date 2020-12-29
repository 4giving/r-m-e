import { Schema } from 'prosemirror-model';

import ExtensionManager from './lib/ExtensionManager';
// marks
import Bold from './marks/Bold';
import Code from './marks/Code';
import Highlight from './marks/Highlight';
import Italic from './marks/Italic';
import Link from './marks/Link';
import TemplatePlaceholder from './marks/Placeholder';
import Strikethrough from './marks/Strikethrough';
import Underline from './marks/Underline';
import Blockquote from './nodes/Blockquote';
import BulletList from './nodes/BulletList';
import CheckboxItem from './nodes/CheckboxItem';
import CheckboxList from './nodes/CheckboxList';
// nodes
import Doc from './nodes/Doc';
import Embed from './nodes/Embed';
import HardBreak from './nodes/HardBreak';
import Heading from './nodes/Heading';
import HorizontalRule from './nodes/HorizontalRule';
import Image from './nodes/Image';
import ListItem from './nodes/ListItem';
import Notice from './nodes/Notice';
import OrderedList from './nodes/OrderedList';
import Paragraph from './nodes/Paragraph';
import Table from './nodes/Table';
import TableCell from './nodes/TableCell';
import TableHeadCell from './nodes/TableHeadCell';
import TableRow from './nodes/TableRow';
import Text from './nodes/Text';

const extensions = new ExtensionManager([
	new Doc(),
	new Text(),
	new HardBreak(),
	new Paragraph(),
	new Blockquote(),
	new BulletList(),
	new CheckboxList(),
	new CheckboxItem(),
	new Embed(),
	new ListItem(),
	new Notice(),
	new Heading(),
	new HorizontalRule(),
	new Image(),
	new Table(),
	new TableCell(),
	new TableHeadCell(),
	new TableRow(),
	new Bold(),
	new Code(),
	new Highlight(),
	new Italic(),
	new Link(),
	new Strikethrough(),
	new TemplatePlaceholder(),
	new Underline(),
	new OrderedList()
]);

export const schema = new Schema({
	nodes: extensions.nodes,
	marks: extensions.marks
});

export const parser = extensions.parser({
	schema
});

export const serializer = extensions.serializer();
