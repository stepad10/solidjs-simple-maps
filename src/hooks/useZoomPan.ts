import { createSignal } from 'solid-js';
import { useMapContext } from '../components/MapProvider';
import {
    Position,
    Coordinates,
    ScaleExtent,
    TranslateExtent,
    createCoordinates,
    createTranslateExtent,
    createScaleExtent,
} from '../types';
import { useZoomBehavior } from './useZoomBehavior';
import { usePanBehavior } from './usePanBehavior';

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
    // Defaults
    const translateExtent = props.translateExtent ?? createTranslateExtent(
        createCoordinates(-Infinity, -Infinity),
        createCoordinates(Infinity, Infinity),
    );
    const scaleExtent = props.scaleExtent ?? createScaleExtent(1, 8);
    const zoom = props.zoom ?? 1;

    const mapContext = useMapContext();

    // State
    const [position, setPosition] = createSignal({ x: 0, y: 0, k: 1 });

    // Ref for the element - MUST be a signal for effects to track it
    const [mapRef, setMapRef] = createSignal<SVGGElement | undefined>(undefined);

    // Mutable ref for bypassing events
    const bypassEvents = { current: false };

    const { getZoomBehavior } = useZoomBehavior({
        get mapRef() { return mapRef(); }, // Access signal
        width: mapContext.width,
        height: mapContext.height,
        projection: mapContext.projection,
        scaleExtent,
        translateExtent,
        filterZoomEvent: props.filterZoomEvent,
        onZoomStart: props.onMoveStart,
        onZoomEnd: props.onMoveEnd,
        onMove: props.onMove,
        bypassEvents,
        onZoom: (transform) => {
            setPosition({ x: transform.x, y: transform.y, k: transform.k });
        }
    });

    usePanBehavior({
        get mapRef() { return mapRef(); }, // Access signal
        width: mapContext.width,
        height: mapContext.height,
        projection: mapContext.projection,
        center: props.center,
        zoom: zoom,
        bypassEvents,
        onPositionChange: setPosition,
        getZoomBehavior
    });

    const transformString = () => `translate(${position().x} ${position().y}) scale(${position().k})`;

    return {
        setMapRef,
        position,
        transformString,
        isPending: false
    };
}
