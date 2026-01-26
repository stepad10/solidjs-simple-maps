import { Component, For } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { MapWithMetadata, Geographies, Geography } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapWithSEO: Component = () => {
    return (
        <MetaProvider>
            <MapWithMetadata
                metadata={{
                    title: "My Awesome Interactive Map",
                    description: "A detailed map of the world created with SolidJS.",
                    keywords: ["map", "solidjs", "world"],
                    author: "Me",
                    canonicalUrl: "https://example.com/map",
                }}
                enableOpenGraph={true}
                enableTwitterCards={true}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <For each={geographies}>
                            {(geo) => <Geography geography={geo} />}
                        </For>
                    )}
                </Geographies>
            </MapWithMetadata>
        </MetaProvider>
    );
};

export default MapWithSEO;
