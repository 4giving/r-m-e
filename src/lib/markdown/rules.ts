import markdownit from 'markdown-it';

import breakPlugin from './breaks';
import embedsPlugin from './embeds';
import markPlugin from './mark';
import underlinesPlugin from './underlines';

export default function rules({ embeds }) {
	return markdownit('default', {
		breaks: false,
		html: false
	})
		.use(embedsPlugin(embeds))
		.use(breakPlugin)
		.use(markPlugin({ delim: '==', mark: 'mark' }))
		.use(markPlugin({ delim: '!!', mark: 'placeholder' }))
		.use(underlinesPlugin);
}
