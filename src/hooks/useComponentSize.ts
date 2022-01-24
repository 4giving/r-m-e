import { useEffect, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export default function useComponentSize(ref): { width: number; height: number } {
	const [size, setSize] = useState({
		width: 0,
		height: 0
	});

	useEffect(() => {
		const sizeObserver = new ResizeObserver(entries => {
			entries.forEach(({ target }) => {
				if (size.width !== target.clientWidth || size.height !== target.clientHeight) {
					setSize({ width: target.clientWidth, height: target.clientHeight });
				}
			});
		});
		sizeObserver.observe(ref.current);

		return () => sizeObserver.disconnect();
	}, [ref]);

	return size;
}
