import memoize from 'lodash/memoize';
import { baseKeymap } from 'prosemirror-commands';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
import { MarkSpec, NodeSpec, Schema, Slice } from 'prosemirror-model';
import { EditorState, Plugin, Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
/* global window File Promise */
import * as React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import BlockMenu from './components/BlockMenu';
import Flex from './components/Flex';
import LinkToolbar from './components/LinkToolbar';
import SelectionToolbar from './components/SelectionToolbar';
import Tooltip from './components/Tooltip';
import baseDictionary from './dictionary';
import ComponentView from './lib/ComponentView';
import Extension from './lib/Extension';
import ExtensionManager from './lib/ExtensionManager';
import headingToSlug from './lib/headingToSlug';
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
import Doc from './nodes/Doc';
import Embed from './nodes/Embed';
import HardBreak from './nodes/HardBreak';
import Heading from './nodes/Heading';
import HorizontalRule from './nodes/HorizontalRule';
import Image from './nodes/Image';
import ListItem from './nodes/ListItem';
import OrderedList from './nodes/OrderedList';
import Paragraph from './nodes/Paragraph';
// nodes
import ReactNode from './nodes/ReactNode';
import Text from './nodes/Text';
// plugins
import BlockMenuTrigger from './plugins/BlockMenuTrigger';
import History from './plugins/History';
import Keys from './plugins/Keys';
import MarkdownPaste from './plugins/MarkdownPaste';
import Placeholder from './plugins/Placeholder';
import SmartText from './plugins/SmartText';
import TrailingNode from './plugins/TrailingNode';
import { dark as darkTheme, light as lightTheme } from './theme';
import { EmbedDescriptor, ToastType } from './types';

export { default as Extension } from './lib/Extension';

export const theme = lightTheme;

export type Props = {
	id?: string;
	value?: string;
	defaultValue: string;
	placeholder: string;
	extensions: Extension[];
	autoFocus?: boolean;
	readOnly?: boolean;
	readOnlyWriteCheckboxes?: boolean;
	dictionary?: Partial<typeof baseDictionary>;
	dark?: boolean;
	theme?: typeof theme;
	template?: boolean;
	headingsOffset?: number;
	scrollTo?: string;
	handleDOMEvents?: {
		[name: string]: (view: EditorView, event: Event) => boolean;
	};
	uploadImage?: (file: File) => Promise<string>;
	onSave?: ({ done: boolean }) => void;
	onCancel?: () => void;
	onChange: (value: () => string) => void;
	onImageUploadStart?: () => void;
	onImageUploadStop?: () => void;
	onCreateLink?: (title: string) => Promise<string>;
	onClickLink: (href: string, event: MouseEvent) => void;
	onHoverLink?: (event: MouseEvent) => boolean;
	onClickHashtag?: (tag: string, event: MouseEvent) => void;
	onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
	embeds: EmbedDescriptor[];
	onShowToast?: (message: string, code: ToastType) => void;
	tooltip: typeof React.Component | React.FC<any>;
	className?: string;
	style?: Record<string, string>;
};

type State = {
	blockMenuOpen: boolean;
	linkMenuOpen: boolean;
	blockMenuSearch: string;
};

type Step = {
	slice: Slice;
};

class RichMarkdownEditor extends React.PureComponent<Props, State> {
	static defaultProps = {
		defaultValue: '',
		placeholder: 'Write something nice…',
		onImageUploadStart: () => {
			// no default behavior
		},
		onImageUploadStop: () => {
			// no default behavior
		},
		onClickLink: href => {
			window.open(href, '_blank');
		},
		embeds: [],
		extensions: [],
		tooltip: Tooltip
	};

	state = {
		blockMenuOpen: false,
		linkMenuOpen: false,
		blockMenuSearch: ''
	};

	extensions: ExtensionManager;
	element?: HTMLElement | null;
	view: EditorView;
	schema: Schema;
	serializer: MarkdownSerializer;
	parser: MarkdownParser;
	plugins: Plugin[];
	keymaps: Plugin[];
	inputRules: InputRule[];
	nodeViews: {
		[name: string]: (node, view, getPos, decorations) => ComponentView;
	};
	nodes: { [name: string]: NodeSpec };
	marks: { [name: string]: MarkSpec };
	commands: Record<string, any>;

	componentDidMount() {
		this.init();

		if (this.props.scrollTo) {
			this.scrollToAnchor(this.props.scrollTo);
		}

		if (this.props.readOnly) return;

		if (this.props.autoFocus) {
			this.focusAtEnd();
		}
	}

	componentDidUpdate(prevProps: Props) {
		// Allow changes to the 'value' prop to update the editor from outside
		if (this.props.value && prevProps.value !== this.props.value) {
			const newState = this.createState(this.props.value);
			this.view.updateState(newState);
		}

		// pass readOnly changes through to underlying editor instance
		if (prevProps.readOnly !== this.props.readOnly) {
			this.view.update({
				...this.view.props,
				editable: () => !this.props.readOnly
			});
		}

		if (this.props.scrollTo && this.props.scrollTo !== prevProps.scrollTo) {
			this.scrollToAnchor(this.props.scrollTo);
		}

		// Focus at the end of the document if switching from readOnly and autoFocus
		// is set to true
		if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
			this.focusAtEnd();
		}
	}

	init() {
		this.extensions = this.createExtensions();
		this.nodes = this.createNodes();
		this.marks = this.createMarks();
		this.schema = this.createSchema();
		this.plugins = this.createPlugins();
		this.keymaps = this.createKeymaps();
		this.serializer = this.createSerializer();
		this.parser = this.createParser();
		this.inputRules = this.createInputRules();
		this.nodeViews = this.createNodeViews();
		this.view = this.createView();
		this.commands = this.createCommands();
	}

	createExtensions() {
		const dictionary = this.dictionary(this.props.dictionary);

		// adding nodes here? Update schema.ts for serialization on the server
		return new ExtensionManager(
			[
				new Doc(),
				new Text(),
				new HardBreak(),
				new Paragraph(),
				new Blockquote(),
				new BulletList(),
				new Embed(),
				new ListItem(),
				new Heading({
					dictionary,
					onShowToast: this.props.onShowToast,
					offset: this.props.headingsOffset
				}),
				new HorizontalRule(),
				new Image({
					dictionary,
					uploadImage: this.props.uploadImage,
					onImageUploadStart: this.props.onImageUploadStart,
					onImageUploadStop: this.props.onImageUploadStop,
					onShowToast: this.props.onShowToast
				}),
				new Bold(),
				new Code(),
				new Highlight(),
				new Italic(),
				new TemplatePlaceholder(),
				new Underline(),
				new Link({
					onKeyboardShortcut: this.handleOpenLinkMenu,
					onClickLink: this.props.onClickLink,
					onClickHashtag: this.props.onClickHashtag,
					onHoverLink: this.props.onHoverLink
				}),
				new Strikethrough(),
				new OrderedList(),
				new History(),
				new SmartText(),
				new TrailingNode(),
				new MarkdownPaste(),
				new Keys({
					onSave: this.handleSave,
					onSaveAndExit: this.handleSaveAndExit,
					onCancel: this.props.onCancel
				}),
				new BlockMenuTrigger({
					dictionary,
					onOpen: this.handleOpenBlockMenu,
					onClose: this.handleCloseBlockMenu
				}),
				new Placeholder({
					placeholder: this.props.placeholder
				}),
				...this.props.extensions
			],
			this
		);
	}

	createPlugins() {
		return this.extensions.plugins;
	}

	createKeymaps() {
		return this.extensions.keymaps({
			schema: this.schema
		});
	}

	createInputRules() {
		return this.extensions.inputRules({
			schema: this.schema
		});
	}

	createNodeViews() {
		return this.extensions.extensions
			.filter((extension: ReactNode) => extension.component)
			.reduce((nodeViews, extension: ReactNode) => {
				const nodeView = (node, view, getPos, decorations) => {
					return new ComponentView(extension.component, {
						editor: this,
						extension,
						node,
						view,
						getPos,
						decorations
					});
				};

				return {
					...nodeViews,
					[extension.name]: nodeView
				};
			}, {});
	}

	createCommands() {
		return this.extensions.commands({
			schema: this.schema,
			view: this.view
		});
	}

	createNodes() {
		return this.extensions.nodes;
	}

	createMarks() {
		return this.extensions.marks;
	}

	createSchema() {
		return new Schema({
			nodes: this.nodes,
			marks: this.marks
		});
	}

	createSerializer() {
		return this.extensions.serializer();
	}

	createParser() {
		return this.extensions.parser({
			schema: this.schema
		});
	}

	createState(value?: string) {
		const doc = this.createDocument(value || this.props.defaultValue);

		return EditorState.create({
			schema: this.schema,
			doc,
			plugins: [
				...this.plugins,
				...this.keymaps,
				dropCursor({ color: this.theme().cursor }),
				gapCursor(),
				inputRules({
					rules: this.inputRules
				}),
				keymap(baseKeymap)
			]
		});
	}

	createDocument(content: string) {
		return this.parser.parse(content);
	}

	createView() {
		if (!this.element) {
			throw new Error('createView called before ref available');
		}

		const isEditingCheckbox = tr => {
			return tr.steps.some(
				(step: Step) =>
					step.slice.content.firstChild &&
					step.slice.content.firstChild.type.name === this.schema.nodes.checkbox_item.name
			);
		};

		const view = new EditorView(this.element, {
			state: this.createState(),
			editable: () => !this.props.readOnly,
			nodeViews: this.nodeViews,
			handleDOMEvents: this.props.handleDOMEvents,
			dispatchTransaction: transaction => {
				const { state, transactions } = this.view.state.applyTransaction(transaction);

				this.view.updateState(state);

				// If any of the transactions being dispatched resulted in the doc
				// changing then call our own change handler to let the outside world
				// know
				if (
					transactions.some(tr => tr.docChanged) &&
					(!this.props.readOnly || (this.props.readOnlyWriteCheckboxes && transactions.some(isEditingCheckbox)))
				) {
					this.handleChange();
				}

				// Because Prosemirror and React are not linked we must tell React that
				// a render is needed whenever the Prosemirror state changes.
				this.forceUpdate();
			}
		});

		return view;
	}

	scrollToAnchor(hash: string) {
		if (!hash) return;

		try {
			const element = document.querySelector(hash);
			if (element) element.scrollIntoView({ behavior: 'smooth' });
		} catch (err) {
			// querySelector will throw an error if the hash begins with a number
			// or contains a period. This is protected against now by safeSlugify
			// however previous links may be in the wild.
			console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
		}
	}

	value = (): string => {
		return this.serializer.serialize(this.view.state.doc);
	};

	handleChange = () => {
		if (!this.props.onChange) return;

		this.props.onChange(() => {
			return this.value();
		});
	};

	handleSave = () => {
		const { onSave } = this.props;
		if (onSave) {
			onSave({ done: false });
		}
	};

	handleSaveAndExit = () => {
		const { onSave } = this.props;
		if (onSave) {
			onSave({ done: true });
		}
	};

	handleOpenLinkMenu = () => {
		this.setState({ linkMenuOpen: true });
	};

	handleCloseLinkMenu = () => {
		this.setState({ linkMenuOpen: false });
	};

	handleOpenBlockMenu = (search: string) => {
		this.setState({ blockMenuOpen: true, blockMenuSearch: search });
	};

	handleCloseBlockMenu = () => {
		if (!this.state.blockMenuOpen) return;
		this.setState({ blockMenuOpen: false });
	};

	// 'public' methods
	focusAtStart = () => {
		const selection = Selection.atStart(this.view.state.doc);
		const transaction = this.view.state.tr.setSelection(selection);
		this.view.dispatch(transaction);
		this.view.focus();
	};

	focusAtEnd = () => {
		const selection = Selection.atEnd(this.view.state.doc);
		const transaction = this.view.state.tr.setSelection(selection);
		this.view.dispatch(transaction);
		this.view.focus();
	};

	getHeadings = () => {
		const headings: { title: string; level: number; id: string }[] = [];
		const previouslySeen = {};

		this.view.state.doc.forEach(node => {
			if (node.type.name === 'heading') {
				// calculate the optimal slug
				const slug = headingToSlug(node);
				let id = slug;

				// check if we've already used it, and if so how many times?
				// Make the new id based on that number ensuring that we have
				// unique ID's even when headings are identical
				if (previouslySeen[slug] > 0) {
					id = headingToSlug(node, previouslySeen[slug]);
				}

				// record that we've seen this slug for the next loop
				previouslySeen[slug] = previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;

				headings.push({
					title: node.textContent,
					level: node.attrs.level,
					id
				});
			}
		});
		return headings;
	};

	theme = () => {
		return this.props.theme || (this.props.dark ? darkTheme : lightTheme);
	};

	dictionary = memoize((providedDictionary?: Partial<typeof baseDictionary>) => {
		return { ...baseDictionary, ...providedDictionary };
	});

	render = () => {
		const { readOnly, readOnlyWriteCheckboxes, style, tooltip, className, onKeyDown } = this.props;
		const dictionary = this.dictionary(this.props.dictionary);

		return (
			<Flex onKeyDown={onKeyDown} style={style} className={className} align="flex-start" justify="center" column>
				<ThemeProvider theme={this.theme()}>
					<React.Fragment>
						<StyledEditor
							readOnly={readOnly}
							readOnlyWriteCheckboxes={readOnlyWriteCheckboxes}
							ref={ref => (this.element = ref)}
						/>
						{!readOnly && this.view && (
							<React.Fragment>
								<SelectionToolbar
									view={this.view}
									dictionary={dictionary}
									commands={this.commands}
									isTemplate={this.props.template === true}
									onClickLink={this.props.onClickLink}
									onCreateLink={this.props.onCreateLink}
									tooltip={tooltip}
								/>
								<LinkToolbar
									view={this.view}
									dictionary={dictionary}
									isActive={this.state.linkMenuOpen}
									onCreateLink={this.props.onCreateLink}
									onClickLink={this.props.onClickLink}
									onShowToast={this.props.onShowToast}
									onClose={this.handleCloseLinkMenu}
									tooltip={tooltip}
								/>
								<BlockMenu
									view={this.view}
									commands={this.commands}
									dictionary={dictionary}
									isActive={this.state.blockMenuOpen}
									search={this.state.blockMenuSearch}
									onClose={this.handleCloseBlockMenu}
									uploadImage={this.props.uploadImage}
									onLinkToolbarOpen={this.handleOpenLinkMenu}
									onImageUploadStart={this.props.onImageUploadStart}
									onImageUploadStop={this.props.onImageUploadStop}
									onShowToast={this.props.onShowToast}
									embeds={this.props.embeds}
								/>
							</React.Fragment>
						)}
					</React.Fragment>
				</ThemeProvider>
			</Flex>
		);
	};
}

const StyledEditor = styled('div')<{
	readOnly?: boolean;
	readOnlyWriteCheckboxes?: boolean;
}>`
	color: ${props => props.theme.text};
	background: ${props => props.theme.background};
	font-family: ${props => props.theme.fontFamily};
	font-weight: ${props => props.theme.fontWeight};
	font-size: 1em;
	line-height: 1.7em;
	width: 100%;
	border-radius: 8px;
	border: 1px solid rgba(48, 46, 40, 0.01);

	.ProseMirror {
		border-radius: 8px;
		padding: 15px;
		border: 1px solid rgba(48, 46, 40, 0.01);
		position: relative;
		outline: none;
		word-wrap: break-word;
		white-space: pre-wrap;
		white-space: break-spaces;
		-webkit-font-variant-ligatures: none;
		font-variant-ligatures: none;
		font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */
	}

	pre {
		white-space: pre-wrap;
	}

	li {
		position: relative;
	}

	img {
		max-width: 100%;
	}

	.image {
		text-align: center;

		img {
			pointer-events: ${props => (props.readOnly ? 'initial' : 'none')};
		}
	}

	.image.placeholder {
		position: relative;
		background: ${props => props.theme.background};

		img {
			opacity: 0.5;
		}
	}

	.ProseMirror-hideselection *::selection {
		background: transparent;
	}
	.ProseMirror-hideselection *::-moz-selection {
		background: transparent;
	}
	.ProseMirror-hideselection {
		caret-color: transparent;
	}

	.ProseMirror-selectednode {
		outline: 2px solid ${props => (props.readOnly ? 'transparent' : props.theme.selected)};
	}

	/* Make sure li selections wrap around markers */

	li.ProseMirror-selectednode {
		outline: none;
	}

	li.ProseMirror-selectednode:after {
		content: '';
		position: absolute;
		left: -32px;
		right: -2px;
		top: -2px;
		bottom: -2px;
		border: 2px solid ${props => props.theme.selected};
		pointer-events: none;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 1em 0 0.5em;
		font-weight: 500;
		cursor: default;

		&:not(.placeholder):before {
			display: ${props => (props.readOnly ? 'none' : 'block')};
			position: absolute;
			font-family: ${props => props.theme.fontFamilyMono};
			color: ${props => props.theme.textSecondary};
			font-size: 13px;
			left: -24px;
		}

		&:hover {
			.heading-anchor {
				opacity: 1;
			}
		}
	}

	.heading-name {
		color: ${props => props.theme.text};

		&:hover {
			text-decoration: none;
		}
	}

	a:first-child {
		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			margin-top: 0;
		}
	}

	h1:not(.placeholder):before {
		content: 'H1';
		line-height: 3em;
	}
	h2:not(.placeholder):before {
		content: 'H2';
		line-height: 2.8em;
	}
	h3:not(.placeholder):before {
		content: 'H3';
		line-height: 2.3em;
	}
	h4:not(.placeholder):before {
		content: 'H4';
		line-height: 2.2em;
	}
	h5:not(.placeholder):before {
		content: 'H5';
	}
	h6:not(.placeholder):before {
		content: 'H6';
	}

	.with-emoji {
		margin-left: -1em;
	}

	.heading-anchor {
		opacity: 0;
		display: ${props => (props.readOnly ? 'block' : 'none')};
		color: ${props => props.theme.textSecondary};
		cursor: pointer;
		background: none;
		border: 0;
		outline: none;
		padding: 2px 12px 2px 4px;
		margin: 0;
		position: absolute;
		transition: opacity 100ms ease-in-out;
		font-family: ${props => props.theme.fontFamilyMono};
		font-size: 22px;
		left: -1.3em;

		&:focus,
		&:hover {
			color: ${props => props.theme.text};
		}
	}

	.placeholder {
		&:before {
			display: block;
			content: ${props => (props.readOnly ? '' : 'attr(data-empty-text)')};
			pointer-events: none;
			height: 0;
			color: ${props => props.theme.placeholder};
		}
	}

	@media print {
		.placeholder {
			display: none;
		}
	}

	blockquote {
		border-left: 3px solid ${props => props.theme.quote};
		margin: 0;
		padding-left: 10px;
		font-style: italic;
	}

	b,
	strong {
		font-weight: 600;
	}

	.template-placeholder {
		color: ${props => props.theme.placeholder};
		border-bottom: 1px dotted ${props => props.theme.placeholder};
		border-radius: 2px;
		cursor: text;

		&:hover {
			border-bottom: 1px dotted ${props => (props.readOnly ? props.theme.placeholder : props.theme.textSecondary)};
		}
	}

	p {
		position: relative;
		margin: 0;
	}

	a {
		color: ${props => props.theme.link};
	}

	a:hover {
		text-decoration: ${props => (props.readOnly ? 'underline' : 'none')};
	}

	ul,
	ol {
		margin: 0 0.1em;
		padding: 0 0 0 1em;

		ul,
		ol {
			margin: 0;
		}
	}

	ol ol {
		list-style: lower-alpha;
	}

	ol ol ol {
		list-style: lower-roman;
	}

	li p:first-child {
		margin: 0;
		word-break: break-word;
	}

	hr {
		height: 0;
		border: 0;
		border-top: 1px solid ${props => props.theme.horizontalRule};
	}

	mark {
		border-radius: 1px;
		color: ${props => props.theme.black};
		background: ${props => props.theme.textHighlight};
	}

	pre {
		display: block;
		overflow-x: auto;
		padding: 0.75em 1em;
		line-height: 1.4em;
		position: relative;
		background: ${props => props.theme.codeBackground};
		border-radius: 4px;
		border: 1px solid ${props => props.theme.codeBorder};

		-webkit-font-smoothing: initial;
		font-family: ${props => props.theme.fontFamilyMono};
		font-size: 13px;
		direction: ltr;
		text-align: left;
		white-space: pre;
		word-spacing: normal;
		word-break: normal;
		-moz-tab-size: 4;
		-o-tab-size: 4;
		tab-size: 4;
		-webkit-hyphens: none;
		-moz-hyphens: none;
		-ms-hyphens: none;
		hyphens: none;
		color: ${props => props.theme.code};
		margin: 0;

		code {
			font-size: 13px;
			background: none;
			padding: 0;
			border: 0;
		}
	}

	.token.comment,
	.token.prolog,
	.token.doctype,
	.token.cdata {
		color: ${props => props.theme.codeComment};
	}

	.token.punctuation {
		color: ${props => props.theme.codePunctuation};
	}

	.token.namespace {
		opacity: 0.7;
	}

	.token.operator,
	.token.boolean,
	.token.number {
		color: ${props => props.theme.codeNumber};
	}

	.token.property {
		color: ${props => props.theme.codeProperty};
	}

	.token.tag {
		color: ${props => props.theme.codeTag};
	}

	.token.string {
		color: ${props => props.theme.codeString};
	}

	.token.selector {
		color: ${props => props.theme.codeSelector};
	}

	.token.attr-name {
		color: ${props => props.theme.codeAttr};
	}

	.token.entity,
	.token.url,
	.language-css .token.string,
	.style .token.string {
		color: ${props => props.theme.codeEntity};
	}

	.token.attr-value,
	.token.keyword,
	.token.control,
	.token.directive,
	.token.unit {
		color: ${props => props.theme.codeKeyword};
	}

	.token.function {
		color: ${props => props.theme.codeFunction};
	}

	.token.statement,
	.token.regex,
	.token.atrule {
		color: ${props => props.theme.codeStatement};
	}

	.token.placeholder,
	.token.variable {
		color: ${props => props.theme.codePlaceholder};
	}

	.token.deleted {
		text-decoration: line-through;
	}

	.token.inserted {
		border-bottom: 1px dotted ${props => props.theme.codeInserted};
		text-decoration: none;
	}

	.token.italic {
		font-style: italic;
	}

	.token.important,
	.token.bold {
		font-weight: bold;
	}

	.token.important {
		color: ${props => props.theme.codeImportant};
	}

	.token.entity {
		cursor: help;
	}

	.scrollable-wrapper {
		position: relative;
		margin: 0.5em 0px;
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;

		&:hover {
			scrollbar-color: ${props => props.theme.scrollbarThumb} ${props => props.theme.scrollbarBackground};
		}

		& ::-webkit-scrollbar {
			height: 14px;
			background-color: transparent;
		}

		&:hover ::-webkit-scrollbar {
			background-color: ${props => props.theme.scrollbarBackground};
		}

		& ::-webkit-scrollbar-thumb {
			background-color: transparent;
			border: 3px solid transparent;
			border-radius: 7px;
		}

		&:hover ::-webkit-scrollbar-thumb {
			background-color: ${props => props.theme.scrollbarThumb};
			border-color: ${props => props.theme.scrollbarBackground};
		}
	}

	.scrollable {
		overflow-y: hidden;
		overflow-x: auto;
		padding-left: 1em;
		margin-left: -1em;
		border-left: 1px solid transparent;
		border-right: 1px solid transparent;
		transition: border 250ms ease-in-out 0s;
	}

	.scrollable-shadow {
		position: absolute;
		top: 0;
		bottom: 0;
		left: -1em;
		width: 16px;
		transition: box-shadow 250ms ease-in-out;
		border: 0px solid transparent;
		border-left-width: 1em;
		pointer-events: none;

		&.left {
			box-shadow: 16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
			border-left: 1em solid ${props => props.theme.background};
		}

		&.right {
			right: 0;
			left: auto;
			box-shadow: -16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
		}
	}

	.block-menu-trigger {
		background-color: #fff;
		display: ${props => (props.readOnly ? 'none' : 'block')};
		height: 30px;
		color: #5faf85;
		border-radius: 100%;
		font-size: 30px;
		position: absolute;
		transition: color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
		outline: none;
		border: 0;
		line-height: 1;
		margin-top: 0px;
		left: -38px;

		&:hover,
		&:focus {
			cursor: pointer;

			color: ${props => props.theme.text};
		}
	}

	@media print {
		.block-menu-trigger {
			display: none;
		}
	}

	.ProseMirror-gapcursor {
		display: none;
		pointer-events: none;
		position: absolute;
	}

	.ProseMirror-gapcursor:after {
		content: '';
		display: block;
		position: absolute;
		top: -2px;
		width: 20px;
		border-top: 1px solid ${props => props.theme.cursor};
		animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
	}

	@keyframes ProseMirror-cursor-blink {
		to {
			visibility: hidden;
		}
	}

	.ProseMirror-focused .ProseMirror-gapcursor {
		display: block;
	}

	@media print {
		em,
		blockquote {
			font-family: 'SF Pro Text', ${props => props.theme.fontFamily};
		}
	}
`;

export default RichMarkdownEditor;
