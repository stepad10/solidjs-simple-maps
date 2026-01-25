import { mergeProps, splitProps, createMemo } from 'solid-js';
import { LineProps, Longitude, Latitude } from '../types';
import { useMapContext } from './MapProvider';

export default function Line(props: LineProps) {
    const merged = mergeProps({
        from: [0, 0] as [Longitude, Latitude],
        to: [0, 0] as [Longitude, Latitude],
        stroke: 'currentcolor',
        strokeWidth: 3,
        fill: 'transparent',
        className: '',
        class: ''
    }, props);

    const [local, rest] = splitProps(merged, [
        'from',
        'to',
        'coordinates',
        'stroke',
        'strokeWidth',
        'fill',
        'className',
        'class'
    ]);

    const { path } = useMapContext();

    const d = createMemo(() => {
        const lineData = {
            type: 'LineString' as const,
            coordinates: local.coordinates || [local.from, local.to],
        };
        return path()(lineData) || '';
    });

    return (
        <path
            d={d()}
            class={`rsm-line ${local.class} ${local.className}`.trim()}
            stroke={local.stroke}
            stroke-width={local.strokeWidth}
            fill={local.fill}
            {...rest}
        />
    );
}
