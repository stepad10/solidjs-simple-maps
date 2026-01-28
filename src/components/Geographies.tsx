import { JSX, mergeProps, splitProps, Show, createEffect } from "solid-js";
import { GeographiesProps } from "../types";
import { useMapContext } from "./MapProvider";
import useGeographies from "../hooks/useGeographies";

export default function Geographies(props: GeographiesProps<boolean>) {
    const merged = mergeProps(
        {
            class: "",
            errorBoundary: false,
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["geography", "children", "parseGeographies", "class", "errorBoundary", "onGeographyError", "fallback"]);

    const mapContext = useMapContext();

    const geoData = useGeographies({
        get geography() {
            return local.geography;
        },
        get parseGeographies() {
            return local.parseGeographies;
        },
    });

    createEffect(() => {
        const error = geoData.error();
        if (error && local.onGeographyError) {
            local.onGeographyError(error);
        }
    });

    return (
        <g class={`rsm-geographies ${local.class}`.trim()} {...rest}>
            <Show
                when={!geoData.loading()}
                fallback={
                    <text x="50%" y="50%" text-anchor="middle">
                        Loading...
                    </text>
                }
            >
                {
                    (() => {
                        const geographyData = geoData.geographies(); // Assuming geographyData is meant to be geoData.geographies()
                        if (!geographyData || geographyData.length === 0) return null;
                        if (!mapContext) return null;

                        return local.children({
                            geographies: geographyData, // Use the extracted geographyData
                            outline: geoData.outline() || "", // Keep as signal access
                            borders: geoData.borders() || "", // Keep as signal access
                            path: mapContext.path(),
                            projection: mapContext.projection(),
                        }) as JSX.Element;
                    }) as unknown as JSX.Element
                }
            </Show>
        </g>
    );
}
