import assert from 'assert';

import { some } from 'lodash';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { Portal } from 'react-portal';

import createAndInsertLink from '../commands/createAndInsertLink';
import baseDictionary from '../dictionary';
import getFormattingMenuItems from '../menus/formatting';
import getMarkRange from '../queries/getMarkRange';
import isMarkActive from '../queries/isMarkActive';
import isNodeActive from '../queries/isNodeActive';
import { MenuItem } from '../types';
import FloatingToolbar from './FloatingToolbar';
import LinkEditor, { SearchResult } from './LinkEditor';
import Menu from './Menu';

type Props = {
	dictionary: typeof baseDictionary;
	tooltip: typeof React.Component | React.FC<any>;
	isTemplate: boolean;
	commands: Record<string, any>;
	onSearchLink?: (term: string) => Promise<SearchResult[]>;
	onClickLink: (href: string, event: MouseEvent) => void;
	onCreateLink?: (title: string) => Promise<string>;
	onShowToast?: (msg: string, code: string) => void;
	view: EditorView;
};

function isActive(props) {
	const { view } = props;
	const { selection } = view.state;

	if (!selection) return false;
	if (selection.empty) return false;
	if (selection.node) return false;

	const slice = selection.content();
	const fragment = slice.content;
	const nodes = fragment.content;

	return some(nodes, n => n.content.size);
}

export default class SelectionToolbar extends React.Component<Props> {
	handleOnCreateLink = async (title: string) => {
		const { dictionary, onCreateLink, view, onShowToast } = this.props;

		if (!onCreateLink) {
			return;
		}

		const { dispatch, state } = view;
		const { from, to } = state.selection;
		assert(from !== to);

		const href = `creating#${title}…`;
		const markType = state.schema.marks.link;

		// Insert a placeholder link
		dispatch(view.state.tr.removeMark(from, to, markType).addMark(from, to, markType.create({ href })));

		createAndInsertLink(view, title, href, {
			onCreateLink,
			onShowToast,
			dictionary
		});
	};

	handleOnSelectLink = ({ href, from, to }: { href: string; from: number; to: number }): void => {
		const { view } = this.props;
		const { state, dispatch } = view;

		const markType = state.schema.marks.link;

		dispatch(state.tr.removeMark(from, to, markType).addMark(from, to, markType.create({ href })));
	};

	render() {
		const { dictionary, onCreateLink, isTemplate, ...rest } = this.props;
		const { view } = rest;
		const { state } = view;
		const { selection }: { selection: any } = state;
		const isCodeSelection = isNodeActive(state.schema.nodes.code_block)(state);

		// toolbar is disabled in code blocks, no bold / italic etc
		if (isCodeSelection) {
			return null;
		}

		const link = isMarkActive(state.schema.marks.link)(state);
		const range = getMarkRange(selection.$from, state.schema.marks.link);

		let items: MenuItem[] = [];
		items = getFormattingMenuItems(state, dictionary);

		if (!items.length) {
			return null;
		}

		return (
			<Portal>
				<FloatingToolbar view={view} active={isActive(this.props)}>
					{link && range ? (
						<LinkEditor
							dictionary={dictionary}
							mark={range.mark}
							from={range.from}
							to={range.to}
							onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
							onSelectLink={this.handleOnSelectLink}
							{...rest}
						/>
					) : (
						<Menu items={items} {...rest} />
					)}
				</FloatingToolbar>
			</Portal>
		);
	}
}
