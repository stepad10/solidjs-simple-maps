import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@solidjs/testing-library';
import { MapMetadata, MapWithMetadata, ComposableMap } from '../src';
import { MetaProvider } from '@solidjs/meta';

describe('MapMetadata', () => {
    afterEach(() => {
        document.title = '';
        document.head.innerHTML = '';
    });

    it('renders title and meta tags', async () => {
        render(() => (
            <MetaProvider>
                <MapMetadata
                    title="Test Map"
                    description="This is a test map"
                    keywords={['test', 'map']}
                    author="Test Author"
                />
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).toBe('Test Map');
            expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'This is a test map');
            expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute('content', 'test, map');
            expect(document.querySelector('meta[name="author"]')).toHaveAttribute('content', 'Test Author');
        });
    });
});

describe('MapWithMetadata', () => {
    it('renders map and metadata', async () => {
        const { container } = render(() => (
            <MetaProvider>
                <MapWithMetadata
                    metadata={{
                        title: 'Map Wrapper',
                        description: 'Wrapper description',
                        keywords: ['wrapper'],
                        author: 'Solid Simple Maps',
                        canonicalUrl: 'https://example.com',
                    }}
                >
                    <ComposableMap />
                </MapWithMetadata>
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).toBe('Map Wrapper');
            expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Wrapper description');
            expect(container.querySelector('.rsm-svg')).toBeInTheDocument();
        });
    });
});
