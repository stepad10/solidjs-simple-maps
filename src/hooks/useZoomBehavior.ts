import { createEffect, onCleanup } from "solid-js";
import { zoom as d3Zoom, ZoomBehavior, D3ZoomEvent } from "d3-zoom";
import { select as d3Select } from "d3-selection";
import { GeoProjection } from "d3-geo";
import { ScaleExtent, TranslateExtent, Position, createCoordinates } from "../types";
import { getCoords } from "../utils";

interface UseZoomBehaviorProps {
    mapRef: SVGGElement | undefined;
    width: () => number; // Accessor
    height: () => number; // Accessor
    projection: () => GeoProjection; // Accessor
    scaleExtent: ScaleExtent;
    translateExtent: TranslateExtent;
    filterZoomEvent?: (event: Event) => boolean;
    onZoom?: (transform: { x: number; y: number; k: number }, sourceEvent?: Event) => void;
    onZoomStart?: ((position: Position, event: Event) => void) | undefined;
    onZoomEnd?: ((position: Position, event: Event) => void) | undefined;
    onMove?: ((position: Position, event: Event) => void) | undefined;
    bypassEvents: { current: boolean }; // Mutable object (simulating ref)
}

export function useZoomBehavior(props: UseZoomBehaviorProps) {
    let zoomBehavior: ZoomBehavior<SVGGElement, unknown> | undefined;

    // We use createEffect to bind the d3 zoom behavior when mapRef, width, height change
    createEffect(() => {
        const element = props.mapRef;
        if (!element) return;

        const svg = d3Select(element);
        const [minZoom, maxZoom] = props.scaleExtent;
        const [[a1, a2], [b1, b2]] = props.translateExtent;

        function handleZoomStart(d3Event: D3ZoomEvent<SVGGElement, unknown>) {
            if (!props.onZoomStart || props.bypassEvents.current) return;
            const coords = getCoords(props.width(), props.height(), d3Event.transform);
            const inverted = props.projection().invert?.(coords);
            if (inverted) {
                props.onZoomStart(
                    {
                        coordinates: createCoordinates(inverted[0], inverted[1]),
                        zoom: d3Event.transform.k,
                    },
                    d3Event.sourceEvent || d3Event,
                );
            }
        }

        function handleZoom(d3Event: D3ZoomEvent<SVGGElement, unknown>) {
            if (props.bypassEvents.current) return;
            const { transform, sourceEvent } = d3Event;

            // Call the zoom callback
            if (props.onZoom) {
                props.onZoom(
                    {
                        x: transform.x,
                        y: transform.y,
                        k: transform.k,
                    },
                    sourceEvent,
                );
            }

            // Immediate callback for responsive feel
            if (!props.onMove) return;
            const coords = getCoords(props.width(), props.height(), transform);
            const inverted = props.projection().invert?.(coords);
            if (inverted) {
                props.onMove(
                    {
                        coordinates: createCoordinates(inverted[0], inverted[1]),
                        zoom: transform.k,
                    },
                    d3Event.sourceEvent || d3Event,
                );
            }
        }

        function handleZoomEnd(d3Event: D3ZoomEvent<SVGGElement, unknown>) {
            if (props.bypassEvents.current) {
                props.bypassEvents.current = false;
                return;
            }
            const coords = getCoords(props.width(), props.height(), d3Event.transform);
            const inverted = props.projection().invert?.(coords);
            if (inverted) {
                const [x, y] = inverted;
                if (!props.onZoomEnd) return;
                props.onZoomEnd({ coordinates: createCoordinates(x, y), zoom: d3Event.transform.k }, d3Event.sourceEvent || d3Event);
            }
        }

        function filterFunc(event: Event | MouseEvent) {
            if (props.filterZoomEvent) {
                return props.filterZoomEvent(event);
            }
            const mouseEvent = event as MouseEvent;
            return !mouseEvent.ctrlKey && !mouseEvent.button;
        }

        zoomBehavior = d3Zoom<SVGGElement, unknown>()
            .filter(filterFunc) // D3 expects specific signature, verify adherence
            .scaleExtent([minZoom, maxZoom])
            .translateExtent([
                [a1, a2],
                [b1, b2],
            ])
            .on("start", handleZoomStart)
            .on("zoom", handleZoom)
            .on("end", handleZoomEnd);

        svg.call(zoomBehavior);

        onCleanup(() => {
            svg.on(".zoom", null);
        });
    });

    return {
        // Return a getter for the behavior in case we need it
        getZoomBehavior: () => zoomBehavior,
    };
}
