import { describe, it, expect, afterEach } from "vitest";
import { render, waitFor } from "@solidjs/testing-library";
import { MapMetadata, MapWithMetadata, ComposableMap } from "../src";
import { MetaProvider } from "@solidjs/meta";

describe("MapMetadata", () => {
    afterEach(() => {
        document.title = "";
        document.head.innerHTML = "";
    });

    it("renders title and meta tags", async () => {
        render(() => (
            <MetaProvider>
                <MapMetadata title="Test Map" description="This is a test map" keywords={["test", "map"]} author="Test Author" />
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).toBe("Test Map");
            expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "This is a test map");
            expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute("content", "test, map");
            expect(document.querySelector('meta[name="author"]')).toHaveAttribute("content", "Test Author");
        });
    });
});

describe("MapWithMetadata", () => {
    it("renders map and metadata", async () => {
        const { container } = render(() => (
            <MetaProvider>
                <MapWithMetadata
                    metadata={{
                        title: "Map Wrapper",
                        description: "Wrapper description",
                        keywords: ["wrapper"],
                        author: "Solid Simple Maps",
                        canonicalUrl: "https://example.com",
                    }}
                >
                    <ComposableMap />
                </MapWithMetadata>
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).toBe("Map Wrapper");
            expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Wrapper description");
            expect(container.querySelector(".rsm-svg")).toBeInTheDocument();
        });
    });
    it("respects enableSEO prop", async () => {
        render(() => (
            <MetaProvider>
                <MapWithMetadata
                    enableSEO={false}
                    // @ts-expect-error Testing partial metadata
                    metadata={{ title: "Hidden" }}
                >
                    <ComposableMap />
                </MapWithMetadata>
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).not.toBe("Hidden");
        });
    });

    it("uses preset values when metadata is missing", async () => {
        render(() => (
            <MetaProvider>
                <MapWithMetadata
                    preset="worldMap"
                    // @ts-expect-error Testing preset defaults
                    metadata={{}}
                >
                    <ComposableMap />
                </MapWithMetadata>
            </MetaProvider>
        ));

        await waitFor(() => {
            // Check for default world map title from preset
            expect(document.title).toContain("World Map");
        });
    });

    it("allows partial overrides of preset", async () => {
        render(() => (
            <MetaProvider>
                <MapWithMetadata
                    preset="worldMap"
                    // @ts-expect-error Testing partial override
                    metadata={{ title: "Custom Title" }}
                >
                    <ComposableMap />
                </MapWithMetadata>
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).toBe("Custom Title");
            // Should still have description from preset
            expect(document.querySelector('meta[name="description"]')).toBeInTheDocument();
        });
    });

    it("conditionally renders social tags", async () => {
        render(() => (
            <MetaProvider>
                <MapWithMetadata
                    enableOpenGraph={false}
                    enableTwitterCards={false}
                    // @ts-expect-error Testing partial metadata
                    metadata={{ title: "Social Map" }}
                >
                    <ComposableMap />
                </MapWithMetadata>
            </MetaProvider>
        ));

        await waitFor(() => {
            expect(document.title).toBe("Social Map");
            expect(document.querySelector('meta[property="og:title"]')).not.toBeInTheDocument();
            expect(document.querySelector('meta[name="twitter:title"]')).not.toBeInTheDocument();
        });
    });
});
