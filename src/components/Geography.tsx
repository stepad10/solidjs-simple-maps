import { createSignal, createMemo, splitProps, mergeProps } from 'solid-js';
import { GeographyProps, PreparedFeature, GeographyEventData } from '../types';
import { useMapContext } from './MapProvider';
import {
    getGeographyCentroid,
    getGeographyBounds,
    getBestGeographyCoordinates,
} from '../utils/geography-utils';

export default function Geography(props: GeographyProps) {
    const merged = mergeProps(
        {
            style: {},
            className: '',
            class: '',
        },
        props,
    );

    const [local, rest] = splitProps(merged, [
        'geography',
        'onClick',
        'onMouseEnter',
        'onMouseLeave',
        'onMouseDown',
        'onMouseUp',
        'onFocus',
        'onBlur',
        'style',
        'className',
        'class',
        'fill',
        'stroke',
        'stroke-width',
    ]);

    const { path } = useMapContext();
    const [isPressed, setPressed] = createSignal(false);
    const [isFocused, setFocus] = createSignal(false);
    const [isHover, setHover] = createSignal(false);

    const geographyEventData = createMemo((): GeographyEventData => {
        return {
            geography: local.geography,
            centroid: getGeographyCentroid(local.geography),
            bounds: getGeographyBounds(local.geography),
            coordinates: getBestGeographyCoordinates(local.geography),
        };
    });

    const currentState = createMemo(() => {
        return isPressed() || isFocused()
            ? isPressed()
                ? 'pressed'
                : 'hover'
            : 'default';
    });

    const svgPath = createMemo(() => {
        return (local.geography as PreparedFeature).svgPath || path()(local.geography);
    });

    const currentStyle = createMemo(() => {
        return (local.style as any)?.[currentState()] || {};
    });

    // ... handlers ...

    return (
        <path
            tabIndex={0}
            d={svgPath() as string || ''}
            fill={currentStyle().fill || local.fill}
            stroke={currentStyle().stroke || local.stroke}
            stroke-width={currentStyle().strokeWidth || local['stroke-width']}
            cursor={(local.style as any)?.default ? 'pointer' : 'default'}
            class={`rsm-geography ${local.class} ${local.className}`.trim()}
            style={local.style ? {} : {}} // Solid style prop - this effectively removes inline styles from the style attribute
            onClick={(evt) => {
                if (local.onClick) local.onClick(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            onMouseEnter={(evt) => {
                setPressed(false); // Ensure pressed state is reset
                setHover(true); // Set hover state
                if (local.onMouseEnter) local.onMouseEnter(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            onMouseLeave={(evt) => {
                setPressed(false); // Ensure pressed state is reset
                setHover(false); // Reset hover state
                if (local.onMouseLeave) local.onMouseLeave(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            onFocus={(evt) => {
                setFocus(true); // Set focus state
                if (local.onFocus) local.onFocus(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            onBlur={(evt) => {
                setFocus(false); // Reset focus state
                if (local.onBlur) local.onBlur(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            onMouseDown={(evt) => {
                setPressed(true); // Set pressed state
                if (local.onMouseDown) local.onMouseDown(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            onMouseUp={(evt) => {
                setPressed(false); // Reset pressed state
                if (local.onMouseUp) local.onMouseUp(evt, {
                    geography: local.geography,
                    centroid: null, // Simplified event data
                    bounds: null, // Simplified event data
                    coordinates: null // Simplified event data
                });
            }}
            {...rest}
        />
    );
}
