import { Component, For } from "solid-js";
import { ComposableMap, Geographies, Geography } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BasicMap: Component = () => {
    return (
        <ComposableMap>
            <Geographies geography={geoUrl}>
                {({ geographies }) => (
                    <For each={geographies}>
                        {(geo) => <Geography geography={geo} fill="#DDD" stroke="#FFF" />}
                    </For>
                )}
            </Geographies>
        </ComposableMap>
    );
};

export default BasicMap;
