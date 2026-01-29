import { mergeProps, splitProps, createMemo } from "solid-js";
import { SphereProps } from "../types";
import { useMapContext } from "./MapProvider";

export default function Sphere(props: SphereProps) {
    const merged = mergeProps(
        {
            id: "sm-sphere",
            fill: "transparent",
            stroke: "currentcolor",
            "stroke-width": 0.5,
            class: "",
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["id", "fill", "stroke", "class"]);

    const { path } = useMapContext();
    const spherePath = createMemo(() => path()({ type: "Sphere" }) || "");

    return (
        <>
            <defs>
                <clipPath id={local.id}>
                    <path d={spherePath()} />
                </clipPath>
            </defs>
            <path
                d={spherePath()}
                fill={local.fill}
                stroke={local.stroke}
                style={{ "pointer-events": "none" }}
                class={`sm-sphere ${local.class}`.trim()}
                {...rest}
            />
        </>
    );
}
