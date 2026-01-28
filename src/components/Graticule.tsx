import { mergeProps, splitProps, createMemo } from "solid-js";
import { geoGraticule } from "d3-geo";
import { GraticuleProps, createGraticuleStep } from "../types";
import { useMapContext } from "./MapProvider";

export default function Graticule(props: GraticuleProps) {
    const merged = mergeProps(
        {
            fill: "transparent",
            stroke: "currentcolor",
            step: createGraticuleStep(10, 10),
            class: "",
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["step", "class", "fill", "stroke"]);

    const { path } = useMapContext();

    const d = createMemo(() => {
        const graticule = geoGraticule().step(local.step)();
        return path()(graticule) || "";
    });

    return <path d={d()} fill={local.fill} stroke={local.stroke} class={`rsm-graticule ${local.class}`.trim()} {...rest} />;
}
