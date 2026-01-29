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
        <g class={`sm-geographies ${local.class}`.trim()} {...rest}>
            <Show
                when={!geoData.loading()}
                fallback={
                    <text x="50%" y="50%" text-anchor="middle">
                        Loading...
                    </text>
                }
            >
                <Show when={geoData.geographies()?.length > 0 && mapContext}>
                    {
                        local.children({
                            geographies: geoData.geographies()!,
                            outline: geoData.outline() || "",
                            borders: geoData.borders() || "",
                            path: mapContext!.path(),
                            projection: mapContext!.projection(),
                        }) as JSX.Element
                    }
                </Show>
            </Show>
        </g>
    );
}
