import { mergeProps, splitProps, JSX } from 'solid-js';
import { ComposableMapProps } from '../types';
import { MapProvider } from './MapProvider';

export default function ComposableMap(props: ComposableMapProps) {
    const merged = mergeProps(
        {
            width: 800,
            height: 600,
            projection: 'geoEqualEarth' as const,
            projectionConfig: {},
            className: '',
            debug: false,
        },
        props,
    );

    const [local, rest] = splitProps(merged, [
        'width',
        'height',
        'projection',
        'projectionConfig',
        'className',
        'class',
        'debug',
        'children',
        'options', // Some version might have options, keeping safe
    ]);

    return (
        <MapProvider
            width={local.width}
            height={local.height}
            projection={local.projection}
            projectionConfig={local.projectionConfig}
        >
            <svg
                viewBox={`0 0 ${local.width} ${local.height}`}
                class={`rsm-svg ${local.class || ''} ${local.className || ''}`.trim()}
                {...rest}
            >
                {local.children}
            </svg>
        </MapProvider>
    );
}
