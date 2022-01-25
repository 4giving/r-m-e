import { EditorView } from 'prosemirror-view';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

import baseDictionary from '../dictionary';
import getFormattingMenuItems from '../menus/formatting';
import { MenuItem } from '../types';
import Menu from './Menu';

interface Props {
	onCreateLink?: (title: string) => Promise<void>;
	onSelectLink?: (options: { href: string; title?: string; from: number; to: number }) => void;
	onClickLink?: (href: string, event: MouseEvent) => void;
	dictionary: typeof baseDictionary;
	insertImageHandler?: (string) => void;
	view: EditorView;
	commands: Record<string, any>;
}

const MenuBar = (props: Props): ReactElement | null => {
	if (!props.view) {
		return null;
	}
	const { dictionary, ...rest } = props;

	const view = props.view;
	const { state } = view;

	const items: MenuItem[] = getFormattingMenuItems(state, dictionary);

	if (!items.length) {
		return null;
	}

	return (
		<MenuBarContainer>
			<Menu items={items} {...rest} />
		</MenuBarContainer>
	);
};

const MenuBarContainer = styled('div')`
	padding: 10px 15px;
	border-bottom: 1px solid rgba(48, 46, 40, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export default MenuBar;
