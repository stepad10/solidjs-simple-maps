import { createSignal, createMemo, mergeProps, splitProps, Show } from "solid-js";
import { MarkerProps } from "../types";
import { useMapContext } from "./MapProvider";

export default function Marker(props: MarkerProps) {
    const merged = mergeProps({ style: {}, class: "" }, props);
    const [local, rest] = splitProps(merged, [
        "coordinates",
        "children",
        "style",
        "class",
        "onClick",
        "onMouseEnter",
        "onMouseLeave",
        "onFocus",
        "onBlur",
        "onMouseDown",
        "onMouseUp",
    ]);

    const { projection } = useMapContext();
    const [isPressed, setPressed] = createSignal(false);
    const [isHover, setHover] = createSignal(false);
    const [isFocused, setFocus] = createSignal(false);

    const projectedCoords = createMemo(() => {
        return projection()(local.coordinates);
    });

    const currentState = createMemo(() => {
        return isPressed() ? "pressed" : isHover() || isFocused() ? "hover" : "default";
    });

    const currentStyle = createMemo(() => {
        const style = local.style as Record<string, unknown>;
        return (style?.[currentState()] as Record<string, string | number>) || {};
    });

    return (
        <Show when={projectedCoords()}>
            <g
                transform={`translate(${projectedCoords()![0]}, ${projectedCoords()![1]})`}
                class={`sm-marker ${local.class}`.trim()}
                onClick={(evt) => {
                    if (local.onClick) local.onClick(evt);
                }}
                onMouseEnter={(evt) => {
                    setHover(true);
                    if (local.onMouseEnter) local.onMouseEnter(evt);
                }}
                onMouseLeave={(evt) => {
                    setHover(false);
                    setPressed(false);
                    if (local.onMouseLeave) local.onMouseLeave(evt);
                }}
                onFocus={(evt) => {
                    setFocus(true);
                    if (local.onFocus) local.onFocus(evt);
                }}
                onBlur={(evt) => {
                    setFocus(false);
                    setPressed(false);
                    if (local.onBlur) local.onBlur(evt);
                }}
                onMouseDown={(evt) => {
                    setPressed(true);
                    if (local.onMouseDown) local.onMouseDown(evt);
                }}
                onMouseUp={(evt) => {
                    setPressed(false);
                    if (local.onMouseUp) local.onMouseUp(evt);
                }}
                {...rest}
            >
                {/* Apply styles to children via context or direct props? 
                    Marker is a group <g>. Logic here implies children inherit or we style the group.
                    React-simple-maps applies style to <g>. */}
                <g
                    fill={currentStyle().fill as string}
                    stroke={currentStyle().stroke as string}
                    stroke-width={(currentStyle()["stroke-width"] || currentStyle().strokeWidth) as string | number}
                >
                    {local.children}
                </g>
            </g>
        </Show>
    );
}
