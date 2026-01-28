import { mergeProps, splitProps } from "solid-js";
import { ComposableMapProps } from "../types";
import { MapProvider } from "./MapProvider";

export default function ComposableMap(props: ComposableMapProps) {
    const merged = mergeProps(
        {
            width: 800,
            height: 600,
            projection: "geoEqualEarth" as const,
            projectionConfig: {},
            class: "",
            debug: false,
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["width", "height", "projection", "projectionConfig", "class", "debug", "children"]);

    return (
        <MapProvider width={local.width} height={local.height} projection={local.projection} projectionConfig={local.projectionConfig}>
            <svg viewBox={`0 0 ${local.width} ${local.height}`} class={`rsm-svg ${local.class}`.trim()} {...rest}>
                {local.children}
            </svg>
        </MapProvider>
    );
}
