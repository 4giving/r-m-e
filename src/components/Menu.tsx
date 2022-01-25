import { capitalize } from 'lodash';
import { findParentNode } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { withTheme } from 'styled-components';

import theme from '../theme';
import { MenuItem } from '../types';
import ToolbarButton from './ToolbarButton';
import ToolbarSeparator from './ToolbarSeparator';

type Props = {
	commands: Record<string, any>;
	view: EditorView;
	theme: typeof theme;
	items: MenuItem[];
	insertImageHandler?: (string) => void;
	onClickLink?: (href: string, event: MouseEvent) => void;
};

const Menu = (props: Props) => {
	const { view, items } = props;
	const { state } = view;

	const handleImagePickedURL = (url: string) => {
		const { state, dispatch } = view;
		const parent = findParentNode(node => !!node)(state.selection);

		const { schema } = view.state;
		if (parent) {
			dispatch(state.tr.insert(parent.pos, schema.nodes.image.create({ src: url })));
		}
	};

	const triggerImagePick = () => {
		if (props.insertImageHandler) {
			props.insertImageHandler(handleImagePickedURL);
		}
	};

	return (
		<>
			{items.map((item, index) => {
				if (item.name === 'separator' && item.visible !== false) {
					return <ToolbarSeparator key={index} />;
				}
				if (!item.icon) {
					return null;
				}
				const Icon = item.icon;
				const isActive = item.active ? item.active(state) : false;

				const handleClick = () => {
					console.log('item.name', item.name);

					if (!item.name || item.visible === false) {
						return;
					} else if (item.name === 'image') {
						return triggerImagePick();
					}

					const command = props.commands[item.name];
					if (command) {
						command(item.attrs);
					} else {
						props.commands[`create${capitalize(item.name)}`](item.attrs);
						// Not sure why / which one to use here.
						// props.commands[item.name](item.attrs);
					}
				};

				return (
					<ToolbarButton
						key={index}
						onClick={handleClick} //() => item.name && props.commands[item.name](item.attrs)}
						active={isActive}
						disabled={item.visible === false}
					>
						<Icon color={isActive ? '#5FAF85' : props.theme.toolbarItem} />
					</ToolbarButton>
				);
			})}
		</>
	);
};
export default withTheme(Menu);
