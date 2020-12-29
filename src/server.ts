import { Schema } from 'prosemirror-model';

import ExtensionManager from './lib/ExtensionManager';
// marks
import Bold from './marks/Bold';
import Italic from './marks/Italic';
import Link from './marks/Link';
import TemplatePlaceholder from './marks/Placeholder';
import Blockquote from './nodes/Blockquote';
import BulletList from './nodes/BulletList';
// nodes
import Doc from './nodes/Doc';
import Embed from './nodes/Embed';
import HardBreak from './nodes/HardBreak';
import Heading from './nodes/Heading';
import HorizontalRule from './nodes/HorizontalRule';
import Image from './nodes/Image';
import ListItem from './nodes/ListItem';
import OrderedList from './nodes/OrderedList';
import Paragraph from './nodes/Paragraph';
import Text from './nodes/Text';

const extensions = new ExtensionManager([
	new Doc(),
	new Text(),
	new HardBreak(),
	new Paragraph(),
	new Blockquote(),
	new BulletList(),

	new Embed(),
	new ListItem(),
	new Heading(),
	new HorizontalRule(),
	new Image(),
	new Bold(),
	new Italic(),
	new Link(),
	new TemplatePlaceholder(),
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
