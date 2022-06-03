import debounce from 'lodash/debounce';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Editor from '../../src';

const element = document.getElementById('main');
const savedText = localStorage.getItem('saved');
const exampleText = `
# Welcome

This is example content. It is persisted between reloads in localStorage.
`;
const defaultValue = savedText || exampleText;

class YoutubeEmbed extends React.Component {
	render() {
		const { attrs } = this.props;
		const videoId = attrs.matches[1];

		return (
			<iframe
				className={this.props.isSelected ? 'ProseMirror-selectednode' : ''}
				src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
			/>
		);
	}
}

const Example = () => {
	const [readOnly, setReadOnly] = React.useState(false);
	const [template, setTemplate] = useState(false);
	const [dark, setDarkMode] = useState(localStorage.getItem('dark') === 'enabled');
	const [value, setValue] = useState(undefined);
	const [imageUrl, setImageUrl] = useState();
	const [imageHandler, setHandler] = useState();

	const handleToggleReadOnly = () => {
		setReadOnly(!readOnly);
	};

	const handleToggleTemplate = () => {
		setTemplate(!template);
	};

	const handleToggleDark = () => {
		setDarkMode({ dark: !dark });
		localStorage.setItem('dark', dark ? 'enabled' : 'disabled');
	};

	const handleUpdateValue = () => {
		const existing = localStorage.getItem('saved') || '';
		const updatedValue = `${existing}\n\nedit!`;
		localStorage.setItem('saved', updatedValue);

		setValue(updatedValue);
	};

	const handleChange = debounce(value => {
		const text = value();
		localStorage.setItem('saved', text);
	}, 250);

	const { body } = document;
	if (body) body.style.backgroundColor = dark ? '#181A1B' : '#FFF';

	const handleChangeOfInput = e => {
		setImageUrl(e.target.value);
	};

	const callImageAdd = () => {
		if (imageUrl && imageHandler) {
			imageHandler(imageUrl);
		} else {
			console.log('imageUrl', imageUrl);
			console.log('imageHandler', imageHandler);
		}
	};

	return (
		<div>
			<div>
				<input onChange={handleChangeOfInput} onBlur={callImageAdd}></input>
			</div>
			<div>
				<br />
				<button type="button" onClick={handleToggleReadOnly}>
					{readOnly ? 'Switch to Editable' : 'Switch to Read-only'}
				</button>{' '}
				<button type="button" onClick={handleToggleDark}>
					{dark ? 'Switch to Light' : 'Switch to Dark'}
				</button>{' '}
				<button type="button" onClick={handleToggleTemplate}>
					{template ? 'Switch to Document' : 'Switch to Template'}
				</button>{' '}
				<button type="button" onClick={handleUpdateValue}>
					Update value
				</button>
			</div>
			<br />
			<br />
			<Editor
				id="example"
				readOnly={readOnly}
				readOnlyWriteCheckboxes
				value={value}
				template={template}
				defaultValue={defaultValue}
				scrollTo={window.location.hash}
				handleDOMEvents={{
					focus: () => console.log('FOCUS'),
					blur: () => console.log('BLUR'),
					paste: () => console.log('PASTE'),
					touchstart: () => console.log('TOUCH START')
				}}
				onSave={options => console.log('Save triggered', options)}
				onCancel={() => console.log('Cancel triggered')}
				onChange={handleChange}
				// onClickLink={(href, event) => console.log('Clicked link: ', href, event)}
				onHoverLink={event => {
					console.log('Hovered link: ', event.target.href);
					return false;
				}}
				onShowToast={(message, type) => window.alert(`${type}: ${message}`)}
				insertImageHandler={handler => {
					setHandler(() => handler);
					// handler('https://picsum.photos/600/600');
				}}
				embeds={[
					{
						title: 'YouTube',
						keywords: 'youtube video tube google',
						icon: () => (
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg"
								width={24}
								height={24}
							/>
						),
						matcher: url => {
							return url.match(
								/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})$/i
							);
						},
						component: YoutubeEmbed
					}
				]}
				dark={dark}
				autoFocus
			/>
		</div>
	);
};

if (element) {
	ReactDOM.render(<Example />, element);
}
