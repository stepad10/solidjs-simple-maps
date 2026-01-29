import { mergeProps, splitProps, createMemo } from "solid-js";
import { ZoomableGroupPropsUnion, SimpleZoomableGroupProps, createCoordinates, createScaleExtent, createTranslateExtent } from "../types";
import { useMapContext } from "./MapProvider";
import { ZoomPanProvider } from "./ZoomPanProvider";
import useZoomPan from "../hooks/useZoomPan";

function isSimpleProps(props: ZoomableGroupPropsUnion): props is SimpleZoomableGroupProps {
    return "enableZoom" in props || "enablePan" in props || ("minZoom" in props && "maxZoom" in props && !("scaleExtent" in props));
}

export default function ZoomableGroup(props: ZoomableGroupPropsUnion) {
    const merged = mergeProps(
        {
            center: createCoordinates(0, 0),
            zoom: 1,
            class: "",
            minZoom: 1,
            maxZoom: 8,
        },
        props,
    );

    const [local, rest] = splitProps(merged, [
        "center",
        "zoom",
        "minZoom",
        "maxZoom",
        "translateExtent",
        "scaleExtent",
        "filterZoomEvent",
        "onMoveStart",
        "onMove",
        "onMoveEnd",
        "class",
        "children",
        "enableZoom",
        "enablePan",
    ]);

    const mapContext = useMapContext();

    // Normalize props
    const config = createMemo(() => {
        const finalMinZoom = local.minZoom;
        const finalMaxZoom = local.maxZoom;
        let finalTranslateExtent = local.translateExtent;

        // Logic from original: if simple props, handle translateExtent logic
        if (isSimpleProps(props)) {
            if (!finalTranslateExtent && local.enablePan !== false) {
                finalTranslateExtent = createTranslateExtent(createCoordinates(-Infinity, -Infinity), createCoordinates(Infinity, Infinity));
            }
        }

        return {
            minZoom: finalMinZoom,
            maxZoom: finalMaxZoom,
            translateExtent: finalTranslateExtent,
        };
    });

    const { setMapRef, position, transformString } = useZoomPan({
        get center() {
            return local.center;
        },
        get zoom() {
            return local.zoom;
        },
        get filterZoomEvent() {
            return local.filterZoomEvent;
        },
        get onMoveStart() {
            return local.onMoveStart;
        },
        get onMove() {
            return local.onMove;
        },
        get onMoveEnd() {
            return local.onMoveEnd;
        },
        get scaleExtent() {
            return createScaleExtent(config().minZoom, config().maxZoom);
        },
        get translateExtent() {
            return config().translateExtent;
        },
    });

    return (
        <ZoomPanProvider value={{ x: position().x, y: position().y, k: position().k, transformString: transformString() }}>
            <g ref={setMapRef}>
                <rect width={mapContext.width()} height={mapContext.height()} fill="transparent" style={{ opacity: 0 }} />
                <g transform={transformString()} class={`sm-zoomable-group ${local.class}`.trim()} {...rest}>
                    {local.children}
                </g>
            </g>
        </ZoomPanProvider>
    );
}
