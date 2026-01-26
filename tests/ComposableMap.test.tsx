import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { ComposableMap } from "../src";

describe("ComposableMap", () => {
    it("renders without crashing", () => {
        const { container } = render(() => (
            <ComposableMap>
                <circle cx="50" cy="50" r="10" />
            </ComposableMap>
        ));

        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass("rsm-svg");
        expect(svg).toHaveAttribute("viewBox", "0 0 800 600");
    });

    it("applies custom dimensions", () => {
        const { container } = render(() => (
            <ComposableMap width={1000} height={500}>
                <g />
            </ComposableMap>
        ));

        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("viewBox", "0 0 1000 500");
    });

    it("applies custom className", () => {
        const { container } = render(() => (
            <ComposableMap class="custom-map">
                <g />
            </ComposableMap>
        ));

        const svg = container.querySelector("svg");
        expect(svg).toHaveClass("rsm-svg");
        expect(svg).toHaveClass("custom-map");
    });
});
