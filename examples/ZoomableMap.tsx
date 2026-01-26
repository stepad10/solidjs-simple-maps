import { Component, For } from "solid-js";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ZoomableMap: Component = () => {
    return (
        <ComposableMap>
            <ZoomableGroup minZoom={1} maxZoom={10}>
                <Geographies geography={geoUrl}>
                    {({ geographies }) => (
                        <For each={geographies}>
                            {(geo) => <Geography geography={geo} fill="#EAEAEC" stroke="#D6D6DA" />}
                        </For>
                    )}
                </Geographies>
            </ZoomableGroup>
        </ComposableMap>
    );
};

export default ZoomableMap;
