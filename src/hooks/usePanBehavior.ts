import { createEffect } from 'solid-js';
import { zoomIdentity as d3ZoomIdentity, ZoomBehavior } from 'd3-zoom';
import { select as d3Select } from 'd3-selection';
import { GeoProjection } from 'd3-geo';
import { ZoomPanState, Coordinates } from '../types';

interface UsePanBehaviorProps {
    mapRef: SVGGElement | undefined;
    width: () => number;
    height: () => number;
    projection: () => GeoProjection;
    center: Coordinates;
    zoom: number;
    bypassEvents: { current: boolean };
    onPositionChange?: (position: ZoomPanState) => void;
    getZoomBehavior: () => ZoomBehavior<SVGGElement, unknown> | undefined;
}

export function usePanBehavior(props: UsePanBehaviorProps) {
    // We use a simple ref to track last position to avoid infinite loops if needed,
    // essentially what useRef does in React
    let lastPosition = { x: 0, y: 0, k: 1 };

    const programmaticMove = (newCenter: Coordinates, newZoom: number) => {
        const [lon, lat] = newCenter;
        const coords = props.projection()([lon, lat]);

        const zoomBehavior = props.getZoomBehavior();
        if (!coords || !props.mapRef || !zoomBehavior) return;

        const x = coords[0] * newZoom;
        const y = coords[1] * newZoom;
        const svg = d3Select(props.mapRef);

        props.bypassEvents.current = true;

        // Direct update (Solid transitions are built-in, we can just call d3)
        svg.call(
            zoomBehavior.transform,
            d3ZoomIdentity
                .translate(props.width() / 2 - x, props.height() / 2 - y)
                .scale(newZoom),
        );

        const newPosition = { x: props.width() / 2 - x, y: props.height() / 2 - y, k: newZoom };
        if (props.onPositionChange) {
            props.onPositionChange(newPosition);
        }

        lastPosition = { x: lon, y: lat, k: newZoom };
    };

    createEffect(() => {
        const [lon, lat] = props.center;
        if (
            lon === lastPosition.x &&
            lat === lastPosition.y &&
            props.zoom === lastPosition.k
        )
            return;

        // Delay slightly to ensure d3 behavior is attached? usually createEffect runs after render
        programmaticMove(props.center, props.zoom);
    });
}
