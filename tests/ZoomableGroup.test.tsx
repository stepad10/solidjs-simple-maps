import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { ComposableMap, ZoomableGroup } from '../src';

describe('ZoomableGroup', () => {
    it('renders with default transform', () => {
        const { container } = render(() => (
            <ComposableMap>
                <ZoomableGroup>
                    <circle cx="0" cy="0" r="10" />
                </ZoomableGroup>
            </ComposableMap>
        ));

        const group = container.querySelector('.rsm-zoomable-group');
        expect(group).toBeInTheDocument();

        // Check for the transparent event capture rect
        const eventRect = container.querySelector('rect');
        expect(eventRect).toBeInTheDocument();
        expect(eventRect).toHaveStyle({ opacity: '0' });
    });

    it('renders children', () => {
        const { container } = render(() => (
            <ComposableMap>
                <ZoomableGroup>
                    <circle className="test-child" cx="10" cy="10" r="5" />
                </ZoomableGroup>
            </ComposableMap>
        ));

        expect(container.querySelector('.test-child')).toBeInTheDocument();
    });
});
