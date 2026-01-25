import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen } from '@solidjs/testing-library';
import { ComposableMap, Geographies, Geography } from '../src';
import { mockTopoJSON } from './mocks/topojson';

// Mock fetch
const fetchSpy = vi.fn();
global.fetch = fetchSpy;

describe('Geographies and Geography', () => {
    beforeEach(() => {
        fetchSpy.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fetches data and renders geographies', async () => {
        fetchSpy.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockTopoJSON),
        });

        render(() => (
            <ComposableMap>
                <Geographies geography="/world.json">
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography geography={geo} data-testid="geo-path" />
                        ))
                    }
                </Geographies>
            </ComposableMap>
        ));

        // Wait for the async fetch to complete and render
        await waitFor(() => {
            const paths = screen.getAllByTestId('geo-path');
            expect(paths).toHaveLength(1);
            expect(paths[0].tagName).toBe('path');
        });

        expect(fetchSpy).toHaveBeenCalledWith('/world.json');
    });

    it('handles events on Geography', async () => {
        // Ideally we test with pre-loaded data to skip async fetch, but here we can reuse the flow
        fetchSpy.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockTopoJSON),
        });

        const handleClick = vi.fn();

        render(() => (
            <ComposableMap>
                <Geographies geography="/world.json">
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                geography={geo}
                                onClick={handleClick}
                                data-testid="interactive-geo"
                            />
                        ))
                    }
                </Geographies>
            </ComposableMap>
        ));

        await waitFor(async () => {
            const path = await screen.findByTestId('interactive-geo');
            expect(path).toBeInTheDocument();
            // Trigger click (requires fireEvent or userEvent, but simple click should work in DOM)
            path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(handleClick).toHaveBeenCalled();
        });
    });
});
