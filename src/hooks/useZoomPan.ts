import { createSignal, mergeProps } from "solid-js";
import { useMapContext } from "../components/MapProvider";
import { Position, Coordinates, ScaleExtent, TranslateExtent, createCoordinates, createTranslateExtent, createScaleExtent } from "../types";
import { useZoomBehavior } from "./useZoomBehavior";
import { usePanBehavior } from "./usePanBehavior";

interface UseZoomPanHookProps {
    center: Coordinates;
    filterZoomEvent?: (event: Event) => boolean;
    onMoveStart?: (position: Position, event: Event) => void;
    onMoveEnd?: (position: Position, event: Event) => void;
    onMove?: (position: Position, event: Event) => void;
    translateExtent?: TranslateExtent;
    scaleExtent?: ScaleExtent;
    zoom?: number;
}

export default function useZoomPan(props: UseZoomPanHookProps) {
    // Defaults with reactivity
    const merged = mergeProps(
        {
            translateExtent: createTranslateExtent(createCoordinates(-Infinity, -Infinity), createCoordinates(Infinity, Infinity)),
            scaleExtent: createScaleExtent(1, 8),
            zoom: 1,
        },
        props,
    );

    const mapContext = useMapContext();

    // State
    const [position, setPosition] = createSignal({ x: 0, y: 0, k: 1 });

    // Ref for the element - MUST be a signal for effects to track it
    const [mapRef, setMapRef] = createSignal<SVGGElement | undefined>(undefined);

    // Mutable ref for bypassing events
    const bypassEvents = { current: false };

    const { getZoomBehavior } = useZoomBehavior({
        get mapRef() {
            return mapRef();
        },
        width: mapContext.width,
        height: mapContext.height,
        projection: mapContext.projection,
        get scaleExtent() { return merged.scaleExtent },
        get translateExtent() { return merged.translateExtent },
        get filterZoomEvent() { return merged.filterZoomEvent },
        get onZoomStart() { return merged.onMoveStart },
        get onZoomEnd() { return merged.onMoveEnd },
        get onMove() { return merged.onMove },
        bypassEvents,
        onZoom: (transform: { x: number; y: number; k: number }) => {
            setPosition({ x: transform.x, y: transform.y, k: transform.k });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any); // Type cast due to getters in object literal which might not match exact interface if strictly checked, 
    // but allows tracking. Ideally UseZoomBehaviorProps should accept accessors. 
    // However, looking at useZoomBehavior, it accesses props properties directly in createEffect.
    // Which means passing an object with getters WORKS for Solid's proxy wrapping or simple property access inside effect.
    // BUT useZoomBehavior takes `props: UseZoomBehaviorProps`. 
    // If useZoomBehavior just uses `props.scaleExtent` inside effect, getters work.

    usePanBehavior({
        get mapRef() {
            return mapRef();
        },
        width: mapContext.width,
        height: mapContext.height,
        projection: mapContext.projection,
        get center() { return merged.center },
        get zoom() { return merged.zoom },
        bypassEvents,
        onPositionChange: setPosition,
        getZoomBehavior,
    });

    const transformString = () => `translate(${position().x} ${position().y}) scale(${position().k})`;

    return {
        setMapRef,
        position,
        transformString,
        isPending: false,
    };
}
