import { createSignal, createMemo, mergeProps, splitProps, Show, JSX } from 'solid-js';
import { MarkerProps } from '../types';
import { useMapContext } from './MapProvider';

export default function Marker(props: MarkerProps) {
    const merged = mergeProps({ style: {}, className: '', class: '' }, props);
    const [local, rest] = splitProps(merged, [
        'coordinates',
        'children',
        'onMouseEnter',
        'onMouseLeave',
        'onMouseDown',
        'onMouseUp',
        'onFocus',
        'onBlur',
        'style',
        'className',
        'class'
    ]);

    const { projection } = useMapContext();
    const [isPressed, setPressed] = createSignal(false);
    const [isFocused, setFocus] = createSignal(false);

    const handleMouseEnter = (evt: MouseEvent) => {
        setFocus(true);
        if (local.onMouseEnter) local.onMouseEnter(evt);
    };

    const handleMouseLeave = (evt: MouseEvent) => {
        setFocus(false);
        if (isPressed()) setPressed(false);
        if (local.onMouseLeave) local.onMouseLeave(evt);
    };

    const handleFocus = (evt: FocusEvent) => {
        setFocus(true);
        if (local.onFocus) local.onFocus(evt);
    };

    const handleBlur = (evt: FocusEvent) => {
        setFocus(false);
        if (isPressed()) setPressed(false);
        if (local.onBlur) local.onBlur(evt);
    };

    const handleMouseDown = (evt: MouseEvent) => {
        setPressed(true);
        if (local.onMouseDown) local.onMouseDown(evt);
    };

    const handleMouseUp = (evt: MouseEvent) => {
        setPressed(false);
        if (local.onMouseUp) local.onMouseUp(evt);
    };

    const projectedCoords = createMemo(() => {
        return projection()(local.coordinates);
    });

    const currentState = createMemo(() => {
        return isPressed() || isFocused()
            ? isPressed()
                ? 'pressed'
                : 'hover'
            : 'default';
    });

    const currentStyle = createMemo(() => {
        return local.style?.[currentState()];
    });

    const transform = createMemo(() => {
        const coords = projectedCoords();
        if (!coords) return undefined;
        const [x, y] = coords;
        return `translate(${x}, ${y})`;
    });

    return (
        <Show when={projectedCoords()}>
            <g
                transform={transform()}
                class={`rsm-marker ${local.class} ${local.className}`.trim()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                style={currentStyle()}
                {...rest}
            >
                {local.children}
            </g>
        </Show>
    );
}
