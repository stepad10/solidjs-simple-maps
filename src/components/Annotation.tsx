import { mergeProps, splitProps, createMemo, Show } from "solid-js";
import { AnnotationProps } from "../types";
import { useMapContext } from "./MapProvider";
import { createConnectorPath } from "../utils";

export default function Annotation(props: AnnotationProps) {
    const merged = mergeProps(
        {
            dx: 30,
            dy: 30,
            curve: 0,
            class: "",
        },
        props,
    );

    const [local, rest] = splitProps(merged, ["subject", "children", "connectorProps", "dx", "dy", "curve", "class"]);

    const { projection } = useMapContext();

    const projectedCoords = createMemo(() => projection()(local.subject));

    const connectorPath = createMemo(() => {
        const coords = projectedCoords();
        if (!coords) return "";
        const [x, y] = coords;
        return createConnectorPath([x, y], [x + local.dx, y + local.dy], local.curve);
    });

    const transform = createMemo(() => {
        const coords = projectedCoords();
        if (!coords) return "";
        const [x, y] = coords;
        return `translate(${x + local.dx}, ${y + local.dy})`;
    });

    return (
        <Show when={projectedCoords()}>
            <g transform={transform()} class={`sm-annotation ${local.class}`.trim()} {...rest}>
                <path d={connectorPath()} fill="transparent" stroke="#000" {...local.connectorProps} />
                {local.children}
            </g>
        </Show>
    );
}
