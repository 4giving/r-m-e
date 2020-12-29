import { InputRule } from 'prosemirror-inputrules';
import { NodeSelection } from 'prosemirror-state';
import { setTextSelection } from 'prosemirror-utils';
import * as React from 'react';
import ImageZoom from 'react-medium-image-zoom';
import styled from 'styled-components';

import Node from './Node';

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const STYLE = {
	display: 'inline-block',
	maxWidth: '100%',
	maxHeight: '75vh'
};
export default class Image extends Node {
	get name() {
		return 'image';
	}

	get schema() {
		return {
			inline: true,
			attrs: {
				src: {},
				alt: {
					default: null
				}
			},
			content: 'text*',
			marks: '',
			group: 'inline',
			selectable: true,
			draggable: true,
			parseDOM: [
				{
					tag: 'div[class=image]',
					getAttrs: (dom: HTMLDivElement) => {
						const img = dom.getElementsByTagName('img')[0];

						return {
							src: img.getAttribute('src'),
							alt: img.getAttribute('alt')
						};
					}
				}
			],
			toDOM: node => {
				return [
					'div',
					{
						class: 'image'
					},
					['img', { ...node.attrs, contentEditable: false }],
					['p', { class: 'caption' }, 0]
				];
			}
		};
	}

	handleKeyDown = ({ node, getPos }) => event => {
		// Pressing Enter in the caption field should move the cursor/selection
		// below the image
		if (event.key === 'Enter') {
			event.preventDefault();

			const { view } = this.editor;
			const pos = getPos() + node.nodeSize;
			view.focus();
			view.dispatch(setTextSelection(pos)(view.state.tr));
			return;
		}

		// Pressing Backspace in an an empty caption field should remove the entire
		// image, leaving an empty paragraph
		if (event.key === 'Backspace' && event.target.innerText === '') {
			const { view } = this.editor;
			const $pos = view.state.doc.resolve(getPos());
			const tr = view.state.tr.setSelection(new NodeSelection($pos));
			view.dispatch(tr.deleteSelection());
			view.focus();
			return;
		}
	};

	handleBlur = ({ node, getPos }) => event => {
		const alt = event.target.innerText;
		const src = node.attrs.src;
		if (alt === node.attrs.alt) return;

		const { view } = this.editor;
		const { tr } = view.state;

		// update meta on object
		const pos = getPos();
		const transaction = tr.setNodeMarkup(pos, undefined, {
			src,
			alt
		});
		view.dispatch(transaction);
	};

	handleSelect = ({ getPos }) => event => {
		event.preventDefault();

		const { view } = this.editor;
		const $pos = view.state.doc.resolve(getPos());
		const transaction = view.state.tr.setSelection(new NodeSelection($pos));
		view.dispatch(transaction);
	};

	component = props => {
		const { theme, isEditable, isSelected } = props;
		const { alt, src } = props.node.attrs;

		return (
			<div contentEditable={false} className="image">
				<ImageWrapper
					className={isSelected ? 'ProseMirror-selectednode' : ''}
					onClick={isEditable ? this.handleSelect(props) : undefined}
				>
					<ImageZoom
						image={{
							src,
							alt,
							style: STYLE
						}}
						defaultStyles={{
							overlay: {
								backgroundColor: theme.background
							}
						}}
						shouldRespectMaxDimension
					/>
				</ImageWrapper>

				{(isEditable || alt) && (
					<Caption
						onKeyDown={this.handleKeyDown(props)}
						onBlur={this.handleBlur(props)}
						tabIndex={-1}
						contentEditable={isEditable}
						suppressContentEditableWarning
					>
						{alt}
					</Caption>
				)}
			</div>
		);
	};

	toMarkdown(state, node) {
		state.write('![' + state.esc((node.attrs.alt || '').replace('\n', '') || '') + '](' + state.esc(node.attrs.src) + ')');
	}

	parseMarkdown() {
		return {
			node: 'image',
			getAttrs: token => ({
				src: token.attrGet('src'),
				alt: (token.children[0] && token.children[0].content) || null
			})
		};
	}

	commands({ type }) {
		return attrs => (state, dispatch) => {
			const { selection } = state;
			const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;
			const node = type.create(attrs);
			const transaction = state.tr.insert(position, node);
			dispatch(transaction);
			return true;
		};
	}

	inputRules({ type }) {
		return [
			new InputRule(IMAGE_INPUT_REGEX, (state, match, start, end) => {
				const [okay, alt, src] = match;
				const { tr } = state;

				if (okay) {
					tr.replaceWith(
						start - 1,
						end,
						type.create({
							src,
							alt
						})
					);
				}

				return tr;
			})
		];
	}
}

const ImageWrapper = styled.span`
	line-height: 0;
	display: inline-block;
`;

const Caption = styled.p`
	border: 0;
	display: block;
	font-size: 13px;
	font-style: italic;
	color: ${props => props.theme.textSecondary};
	padding: 2px 0;
	line-height: 16px;
	text-align: center;
	width: 100%;
	min-height: 1em;
	outline: none;
	background: none;
	resize: none;
	user-select: text;

	&:empty:before {
		color: ${props => props.theme.placeholder};
		content: 'Write a caption';
		pointer-events: none;
	}
`;
