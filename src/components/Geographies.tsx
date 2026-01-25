import { JSX, mergeProps, splitProps, Show } from 'solid-js';
import { GeographiesProps } from '../types';
import { useMapContext } from './MapProvider';
import useGeographies from '../hooks/useGeographies';

export default function Geographies(props: GeographiesProps<boolean>) {
    const merged = mergeProps(
        {
            className: '',
            class: '',
            errorBoundary: false,
        },
        props,
    );

    const [local, rest] = splitProps(merged, [
        'geography',
        'children',
        'parseGeographies',
        'className',
        'class',
        'errorBoundary',
        'onGeographyError',
        'fallback',
    ]);

    const mapContext = useMapContext();

    const geoData = useGeographies({
        geography: local.geography,
        parseGeographies: local.parseGeographies,
    });

    return (
        <g class={`rsm-geographies ${local.class || ''} ${local.className || ''}`.trim()} {...rest}>
            <Show when={!geoData.loading()} fallback={<text x="50%" y="50%" text-anchor="middle">Loading...</text>}>
                {() => {
                    const geographies = geoData.geographies();
                    if (!geographies || geographies.length === 0) return null;

                    return local.children({
                        geographies: geographies,
                        outline: geoData.outline() || '',
                        borders: geoData.borders() || '',
                        path: mapContext.path(),
                        projection: mapContext.projection(),
                    });
                }}
            </Show>
        </g>
    );
}
