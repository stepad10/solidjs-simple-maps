import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, screen } from "@solidjs/testing-library";
import { ErrorBoundary } from "solid-js";
import { ComposableMap, Geographies, Geography } from "../src";
import { mockTopoJSON } from "./mocks/topojson";

// Mock fetch
const fetchSpy = vi.fn();
global.fetch = fetchSpy;

describe("Geographies and Geography", () => {
    beforeEach(() => {
        fetchSpy.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("fetches data and renders geographies", async () => {
        fetchSpy.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockTopoJSON),
        });

        render(() => (
            <ComposableMap>
                <Geographies geography="/world.json">
                    {({ geographies }) => geographies.map((geo) => <Geography geography={geo} data-testid="geo-path" />)}
                </Geographies>
            </ComposableMap>
        ));

        // Wait for the async fetch to complete and render
        await waitFor(() => {
            const paths = screen.getAllByTestId("geo-path");
            expect(paths).toHaveLength(1);
            expect(paths[0].tagName).toBe("path");
        });

        expect(fetchSpy).toHaveBeenCalledWith("/world.json");
    });

    it("handles events on Geography", async () => {
        // Ideally we test with pre-loaded data to skip async fetch, but here we can reuse the flow
        fetchSpy.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockTopoJSON),
        });

        const handleClick = vi.fn();

        render(() => (
            <ComposableMap>
                <Geographies geography="/world.json">
                    {({ geographies }) => geographies.map((geo) => <Geography geography={geo} onClick={handleClick} data-testid="interactive-geo" />)}
                </Geographies>
            </ComposableMap>
        ));

        await waitFor(async () => {
            const path = await screen.findByTestId("interactive-geo");
            expect(path).toBeInTheDocument();
            // Trigger click (requires fireEvent or userEvent, but simple click should work in DOM)
            path.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            expect(handleClick).toHaveBeenCalled();
        });
    });

    it("provides correct event data on click", async () => {
        // Reset mock for this test
        fetchSpy.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockTopoJSON),
        });

        const handleClick = vi.fn();

        render(() => (
            <ComposableMap>
                <Geographies geography="/world.json">
                    {({ geographies }) => geographies.map((geo) => <Geography geography={geo} onClick={handleClick} data-testid="data-geo" />)}
                </Geographies>
            </ComposableMap>
        ));

        await waitFor(async () => {
            const path = await screen.findByTestId("data-geo");
            path.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handleClick).toHaveBeenCalled();
            const callArgs = handleClick.mock.calls[0];
            const eventData = callArgs[1]; // Second argument is data

            expect(eventData).toHaveProperty("geography");
        });
    });

    it("handles fetch errors", async () => {
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: "Not Found",
        });

        const handleError = vi.fn();

        render(() => (
            <ErrorBoundary fallback={(err) => <div>Caught: {err.message}</div>}>
                <ComposableMap>
                    <Geographies geography="/invalid.json" onGeographyError={handleError}>
                        {({ geographies }) => geographies.map((geo) => <Geography geography={geo} />)}
                    </Geographies>
                </ComposableMap>
            </ErrorBoundary>
        ));

        await waitFor(() => {
            expect(handleError).toHaveBeenCalled();
        });
    });

    it("renders geographies supplied as object data", async () => {
        render(() => (
            <ComposableMap>
                <Geographies geography={mockTopoJSON as any}>
                    {({ geographies }) => geographies.map((geo) => <Geography geography={geo} data-testid="object-geo-path" />)}
                </Geographies>
            </ComposableMap>
        ));

        // Should render immediately as data is present
        const paths = screen.getAllByTestId("object-geo-path");
        expect(paths).toHaveLength(1);
        expect(paths[0].tagName).toBe("path");
        // Verify fetch was NOT called
        expect(fetchSpy).not.toHaveBeenCalled();
    });

});
