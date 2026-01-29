import { createSignal, createMemo, splitProps, mergeProps } from "solid-js";
import { GeographyProps, PreparedFeature, GeographyEventData } from "../types";
import { useMapContext } from "./MapProvider";
import { getGeographyCentroid, getGeographyBounds, getBestGeographyCoordinates } from "../utils/geography-utils";

export default function Geography(props: GeographyProps) {
    const merged = mergeProps(
        {
            styleOptions: {},
            class: "",
        },
        props,
    );

    const [local, rest] = splitProps(merged, [
        "geography",
        "onClick",
        "onMouseEnter",
        "onMouseLeave",
        "onMouseDown",
        "onMouseUp",
        "onFocus",
        "onBlur",
        "styleOptions",
        "class",
        "fill",
        "stroke",
        "stroke-width",
    ]);

    const { path } = useMapContext();
    const [isPressed, setPressed] = createSignal(false);
    const [isFocused, setFocus] = createSignal(false);
    const [isHover, setHover] = createSignal(false);

    // Optimized: Calculate event data only when needed
    const getEventData = (): GeographyEventData => {
        return {
            geography: local.geography,
            centroid: getGeographyCentroid(local.geography),
            bounds: getGeographyBounds(local.geography),
            coordinates: getBestGeographyCoordinates(local.geography),
        };
    };

    const currentState = createMemo(() => {
        return isPressed() ? "pressed" : isHover() || isFocused() ? "hover" : "default";
    });

    const svgPath = createMemo(() => {
        return (local.geography as PreparedFeature).svgPath || path()(local.geography);
    });

    const currentStyle = createMemo(() => {
        const style = local.styleOptions as Record<string, unknown>;
        return (style?.[currentState()] as Record<string, string | number>) || {};
    });

    return (
        <path
            tabIndex={0}
            d={(svgPath() as string) || ""}
            fill={(currentStyle().fill as string) || local.fill}
            stroke={(currentStyle().stroke as string) || local.stroke}
            stroke-width={(currentStyle()["stroke-width"] as string | number) || local["stroke-width"]}
            cursor={(local.styleOptions as Record<string, unknown>)?.default ? "pointer" : "default"}
            class={`sm-geography ${local.class}`.trim()}
            style={{}}
            onClick={(evt) => {
                if (local.onClick) local.onClick(evt, getEventData());
            }}
            onMouseEnter={(evt) => {
                setPressed(false);
                setHover(true);
                if (local.onMouseEnter) local.onMouseEnter(evt, getEventData());
            }}
            onMouseLeave={(evt) => {
                setPressed(false);
                setHover(false);
                if (local.onMouseLeave) local.onMouseLeave(evt, getEventData());
            }}
            onFocus={(evt) => {
                setFocus(true);
                if (local.onFocus) local.onFocus(evt, getEventData());
            }}
            onBlur={(evt) => {
                setFocus(false);
                if (local.onBlur) local.onBlur(evt, getEventData());
            }}
            onMouseDown={(evt) => {
                setPressed(true);
                if (local.onMouseDown) local.onMouseDown(evt, getEventData());
            }}
            onMouseUp={(evt) => {
                setPressed(false);
                if (local.onMouseUp) local.onMouseUp(evt, getEventData());
            }}
            {...rest}
        />
    );
}
