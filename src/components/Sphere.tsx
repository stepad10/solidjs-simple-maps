import { mergeProps, splitProps, createMemo } from "solid-js";
import { SphereProps } from "../types";
import { useMapContext } from "./MapProvider";

export default function Sphere(props: SphereProps) {
    const merged = mergeProps(
        {
            id: "rsm-sphere",
            fill: "transparent",
            stroke: "currentcolor",
            strokeWidth: 0.5,
            className: "",
            class: "",
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["id", "fill", "stroke", "strokeWidth", "className", "class"]);

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
                stroke-width={local.strokeWidth}
                style={{ "pointer-events": "none" }}
                class={`rsm-sphere ${local.class} ${local.className}`.trim()}
                {...rest}
            />
        </>
    );
}
