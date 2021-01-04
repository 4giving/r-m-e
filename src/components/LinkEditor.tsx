import { CloseIcon, OpenIcon, TrashIcon } from 'outline-icons';
import { Mark } from 'prosemirror-model';
import { setTextSelection } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import styled, { withTheme } from 'styled-components';

import baseDictionary from '../dictionary';
import isUrl from '../lib/isUrl';
import theme from '../theme';
import Flex from './Flex';
import Input from './Input';
import ToolbarButton from './ToolbarButton';

type Props = {
	mark?: Mark;
	from: number;
	to: number;
	tooltip: typeof React.Component | React.FC<any>;
	dictionary: typeof baseDictionary;
	onRemoveLink?: () => void;
	onCreateLink?: (title: string) => Promise<void>;
	onSelectLink: (options: { href: string; title?: string; from: number; to: number }) => void;
	onClickLink: (href: string, event: MouseEvent) => void;
	view: EditorView;
	theme: typeof theme;
};

type State = {
	value: string;
	previousValue: string;
	selectedIndex: number;
};

class LinkEditor extends React.Component<Props, State> {
	discardInputValue = false;
	initialValue = this.href;
	initialSelectionLength = this.props.to - this.props.from;

	state: State = {
		selectedIndex: -1,
		value: this.href,
		previousValue: ''
	};

	get href(): string {
		return this.props.mark ? this.props.mark.attrs.href : '';
	}

	get suggestedLinkTitle(): string {
		const { state } = this.props.view;
		const { value } = this.state;
		const selectionText = state.doc.cut(state.selection.from, state.selection.to).textContent;

		return value.trim() || selectionText.trim();
	}

	componentWillUnmount = () => {
		// If we discarded the changes then nothing to do
		if (this.discardInputValue) {
			return;
		}

		// If the link is the same as it was when the editor opened, nothing to do
		if (this.state.value === this.initialValue) {
			return;
		}

		// If the link is totally empty or only spaces then remove the mark
		const href = (this.state.value || '').trim();
		if (!href) {
			return this.handleRemoveLink();
		}

		this.save(href, href);
	};

	save = (href: string, title?: string): void => {
		href = href.trim();

		if (href.length === 0) return;

		this.discardInputValue = true;
		const { from, to } = this.props;

		// If the input doesn't start with a protocol or relative slash, make sure
		// a protocol is added to the beginning
		if (!isUrl(href) && !href.startsWith('/')) {
			href = `https://${href}`;
		}

		this.props.onSelectLink({ href, title, from, to });
	};

	handleKeyDown = (event: React.KeyboardEvent): void => {
		switch (event.key) {
			case 'Enter': {
				event.preventDefault();
				const { value } = this.state;

				// saves the raw input as href
				this.save(value, value);

				if (this.initialSelectionLength) {
					this.moveSelectionToEnd();
				}

				return;
			}

			case 'Escape': {
				event.preventDefault();

				if (this.initialValue) {
					this.setState({ value: this.initialValue }, this.moveSelectionToEnd);
				} else {
					this.handleRemoveLink();
				}
				return;
			}
		}
	};

	handleFocusLink = (selectedIndex: number) => {
		this.setState({ selectedIndex });
	};

	handleChange = async (event): Promise<void> => {
		const value = event.target.value;

		this.setState({
			value,
			selectedIndex: -1
		});
	};

	handleOpenLink = (event): void => {
		console.log('');
		event.preventDefault();
		this.props.onClickLink(this.href, event);
	};

	handleCreateLink = (value: string) => {
		this.discardInputValue = true;
		const { onCreateLink } = this.props;

		value = value.trim();
		if (value.length === 0) return;

		if (onCreateLink) return onCreateLink(value);
	};

	handleRemoveLink = (): void => {
		this.discardInputValue = true;

		const { from, to, mark, view, onRemoveLink } = this.props;
		const { state, dispatch } = this.props.view;

		if (mark) {
			dispatch(state.tr.removeMark(from, to, mark));
		}

		if (onRemoveLink) {
			onRemoveLink();
		}

		view.focus();
	};

	handleSelectLink = (url: string, title: string) => event => {
		event.preventDefault();
		this.save(url, title);

		if (this.initialSelectionLength) {
			this.moveSelectionToEnd();
		}
	};

	moveSelectionToEnd = () => {
		const { to, view } = this.props;
		const { state, dispatch } = view;
		dispatch(setTextSelection(to)(state.tr));
		view.focus();
	};

	render() {
		const { dictionary, theme } = this.props;
		const { value } = this.state;

		const Tooltip = this.props.tooltip;
		const looksLikeUrl = value.match(/^https?:\/\//i);

		const suggestedLinkTitle = this.suggestedLinkTitle;

		const showCreateLink =
			!!this.props.onCreateLink &&
			!(suggestedLinkTitle === this.initialValue) &&
			suggestedLinkTitle.length > 0 &&
			!looksLikeUrl;

		return (
			<Wrapper>
				<Input
					value={value}
					placeholder={showCreateLink ? dictionary.findOrCreateDoc : dictionary.searchOrPasteLink}
					onKeyDown={this.handleKeyDown}
					onChange={this.handleChange}
					autoFocus={this.href === ''}
				/>

				<ToolbarButton onClick={this.handleOpenLink} disabled={!value}>
					<Tooltip tooltip={dictionary.openLink} placement="top">
						<OpenIcon color={theme.toolbarItem} />
					</Tooltip>
				</ToolbarButton>
				<ToolbarButton onClick={this.handleRemoveLink}>
					<Tooltip tooltip={dictionary.removeLink} placement="top">
						{this.initialValue ? <TrashIcon color={theme.toolbarItem} /> : <CloseIcon color={theme.toolbarItem} />}
					</Tooltip>
				</ToolbarButton>
			</Wrapper>
		);
	}
}

const Wrapper = styled(Flex as any)`
	margin-left: -8px;
	margin-right: -8px;
	min-width: 336px;
`;

export default withTheme(LinkEditor);
