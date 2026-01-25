import { createSignal, createMemo, splitProps, mergeProps } from 'solid-js';
import { GeographyProps, PreparedFeature, GeographyEventData } from '../types';
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
    ]);

    const [isPressed, setPressed] = createSignal(false);
    const [isFocused, setFocus] = createSignal(false);

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
        return (local.geography as PreparedFeature).svgPath;
    });

    const currentStyle = createMemo(() => {
        return local.style[currentState()] || {};
    });

    const handleMouseEnter = (evt: MouseEvent & { currentTarget: SVGPathElement; target: Element }) => {
        setFocus(true);
        if (local.onMouseEnter) local.onMouseEnter(evt, geographyEventData());
    };

    const handleMouseLeave = (evt: MouseEvent & { currentTarget: SVGPathElement; target: Element }) => {
        setFocus(false);
        if (isPressed()) setPressed(false);
        if (local.onMouseLeave) local.onMouseLeave(evt, geographyEventData());
    };

    const handleFocus = (evt: FocusEvent & { currentTarget: SVGPathElement; target: Element }) => {
        setFocus(true);
        if (local.onFocus) local.onFocus(evt, geographyEventData());
    };

    const handleBlur = (evt: FocusEvent & { currentTarget: SVGPathElement; target: Element }) => {
        setFocus(false);
        if (isPressed()) setPressed(false);
        if (local.onBlur) local.onBlur(evt, geographyEventData());
    };

    const handleMouseDown = (evt: MouseEvent & { currentTarget: SVGPathElement; target: Element }) => {
        setPressed(true);
        if (local.onMouseDown) local.onMouseDown(evt, geographyEventData());
    };

    const handleMouseUp = (evt: MouseEvent & { currentTarget: SVGPathElement; target: Element }) => {
        setPressed(false);
        if (local.onMouseUp) local.onMouseUp(evt, geographyEventData());
    };

    const handleClick = (evt: MouseEvent & { currentTarget: SVGPathElement; target: Element }) => {
        if (local.onClick) local.onClick(evt, geographyEventData());
    };

    return (
        <path
            tabIndex={0}
            class={`rsm-geography ${local.class} ${local.className}`.trim()}
            d={svgPath()}
            on:click={handleClick}
            on:mouseenter={handleMouseEnter}
            on:mouseleave={handleMouseLeave}
            on:focus={handleFocus}
            on:blur={handleBlur}
            on:mousedown={handleMouseDown}
            on:mouseup={handleMouseUp}
            style={currentStyle()}
            {...rest}
        />
    );
}
