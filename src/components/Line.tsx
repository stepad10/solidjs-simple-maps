import { mergeProps, splitProps, createMemo } from "solid-js";
import { LineProps, Longitude, Latitude } from "../types";
import { useMapContext } from "./MapProvider";

export default function Line(props: LineProps) {
    const merged = mergeProps(
        {
            from: [0, 0] as [Longitude, Latitude],
            to: [0, 0] as [Longitude, Latitude],
            stroke: "currentcolor",
            "stroke-width": 3,
            fill: "transparent",
            class: "",
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["from", "to", "coordinates", "stroke", "fill", "class"]);

    const { path } = useMapContext();

    const d = createMemo(() => {
        const lineData = {
            type: "LineString" as const,
            coordinates: local.coordinates || [local.from, local.to],
        };
        return path()(lineData) || "";
    });

    return <path d={d()} class={`sm-line ${local.class}`.trim()} stroke={local.stroke} fill={local.fill} {...rest} />;
}
