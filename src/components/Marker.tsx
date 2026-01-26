import { createSignal, createMemo, mergeProps, splitProps, Show, JSX } from 'solid-js';
import { MarkerProps } from '../types';
import { useMapContext } from './MapProvider';

export default function Marker(props: MarkerProps) {
    const merged = mergeProps({ style: {}, className: '', class: '' }, props);
    const [local, rest] = splitProps(merged, [
        'coordinates',
        'children',
        'style',
        'className',
        'class',
        'onClick',
        'onMouseEnter',
        'onMouseLeave',
        'onFocus',
        'onBlur',
        'onMouseDown',
        'onMouseUp',
    ]);

    const { projection } = useMapContext();
    const [isPressed, setPressed] = createSignal(false);
    const [isHover, setHover] = createSignal(false);
    const [isFocused, setFocus] = createSignal(false);

    const projectedCoords = createMemo(() => {
        return projection()(local.coordinates);
    });

    const currentState = createMemo(() => {
        return isPressed() || isHover() || isFocused()
            ? isPressed()
                ? 'pressed'
                : 'hover'
            : 'default';
    });

    return (
        <Show when={projectedCoords()}>
            <g
                transform={`translate(${projectedCoords()![0]}, ${projectedCoords()![1]})`}
                class={`rsm-marker ${local.class} ${local.className}`.trim()}
                style={local.style ? {} : {}}
                onClick={(evt) => {
                    if (local.onClick) (local.onClick as any)(evt);
                }}
                onMouseEnter={(evt) => {
                    setHover(true);
                    if (local.onMouseEnter) (local.onMouseEnter as any)(evt);
                }}
                onMouseLeave={(evt) => {
                    setHover(false);
                    setPressed(false);
                    if (local.onMouseLeave) (local.onMouseLeave as any)(evt);
                }}
                onFocus={(evt) => {
                    setFocus(true);
                    if (local.onFocus) (local.onFocus as any)(evt);
                }}
                onBlur={(evt) => {
                    setFocus(false);
                    setPressed(false);
                    if (local.onBlur) (local.onBlur as any)(evt);
                }}
                onMouseDown={(evt) => {
                    setPressed(true);
                    if (local.onMouseDown) (local.onMouseDown as any)(evt);
                }}
                onMouseUp={(evt) => {
                    setPressed(false);
                    if (local.onMouseUp) (local.onMouseUp as any)(evt);
                }}
                {...rest}
            >
                {local.children}
            </g>
        </Show>
    );
}
