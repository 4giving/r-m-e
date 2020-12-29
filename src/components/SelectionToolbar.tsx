import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import styled from 'styled-components';

import baseDictionary from '../dictionary';
import getFormattingMenuItems from '../menus/formatting';
import getMarkRange from '../queries/getMarkRange';
import isMarkActive from '../queries/isMarkActive';
import isNodeActive from '../queries/isNodeActive';
import { MenuItem } from '../types';
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

export default class SelectionToolbar extends React.Component<Props> {
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

		const items: MenuItem[] = getFormattingMenuItems(state, isTemplate, dictionary);

		if (!items.length) {
			return null;
		}

		return (
			<StyledToolbar>
				{link && range ? (
					<LinkEditor
						dictionary={dictionary}
						mark={range.mark}
						from={range.from}
						to={range.to}
						onSelectLink={this.handleOnSelectLink}
						{...rest}
					/>
				) : (
					<Menu items={items} {...rest} />
				)}
			</StyledToolbar>
		);
	}
}

const StyledToolbar = styled('div')`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 10px 20px;

	background: #ffffff;

	border: 1px solid rgba(48, 46, 40, 0.1);
	box-sizing: border-box;
	border-radius: 8px;

	flex: none;
	order: 0;
	align-self: stretch;
	flex-grow: 0;
	margin: 15px 0;
`;
