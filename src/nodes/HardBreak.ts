import Node from './Node';

export default class HardBreak extends Node {
	get name() {
		return 'br';
	}

	get schema() {
		return {
			inline: true,
			group: 'inline',
			selectable: false,
			parseDOM: [{ tag: 'br' }],
			toDOM() {
				return ['br'];
			}
		};
	}

	commands({ type }) {
		return () => (state, dispatch) => {
			dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
			return true;
		};
	}

	keys({ type }) {
		return {
			'Shift-Enter': (state, dispatch) => {
				dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
				return true;
			}
		};
	}

	toMarkdown(state) {
		state.write(' \\n ');
	}

	parseMarkdown() {
		return { node: 'br' };
	}
}
