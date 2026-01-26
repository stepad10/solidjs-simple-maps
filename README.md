# solidjs-simple-maps

An SVG map chart component built for SolidJS, heavily inspired by `react-simple-maps`.

## Features

- **Declarative API**: Build maps using composable components.
- **Topographical Support**: Works with TopoJSON files.
- **Zoom & Pan**: Built-in support for zooming and panning interactions.
- **SEO Ready**: Optional `MapWithMetadata` component for SEO optimization (OpenGraph, Twitter Cards, etc.).
- **Type Safe**: Written in TypeScript with full type definitions.
- **Lightweight**: Optimized for performance.

## Installation

```bash
npm install solidjs-simple-maps solid-js @solidjs/meta
```
*Note: `d3-geo`, `d3-selection`, `d3-zoom` and `topojson-client` are installed automatically as dependencies. `@solidjs/meta` is required if you use `MapWithMetadata`.*

## Basic Usage

Using the `<For>` component for efficient rendering:

```jsx
import { For } from "solid-js";
import { ComposableMap, Geographies, Geography } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
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
}
```

## Zoomable Map Example

Wrap your map content in `ZoomableGroup` to enable pan and zoom:

```jsx
import { For } from "solid-js";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
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
}
```

## Advanced Usage

### SEO & Metadata

You can use the `MapWithMetadata` wrapper to automatically inject SEO tags into the head of your document using `@solidjs/meta`.

```jsx
import { For } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { MapWithMetadata, Geographies, Geography } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
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
}
```

### Handling Events & Styling

Props like `onClick`, `onMouseEnter`, etc. give you access to the geography data.

```jsx
import { For } from "solid-js";
import { ComposableMap, Geographies, Geography } from "solidjs-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
    return (
        <ComposableMap>
            <Geographies geography={geoUrl} onGeographyError={(error) => console.error("Failed to load map:", error)}>
                {({ geographies }) => (
                    <For each={geographies}>
                        {(geo) => (
                            <Geography
                                geography={geo}
                                onClick={(e) => alert(`You clicked ${geo.properties.name}`)}
                                style={{
                                    default: { fill: "#D6D6DA", outline: "none" },
                                    hover: { fill: "#F53", outline: "none" },
                                    pressed: { fill: "#E42", outline: "none" },
                                }}
                            />
                        )}
                    </For>
                )}
            </Geographies>
        </ComposableMap>
    );
}
```

## Known Differences from React Version

- **Event Handlers**: SolidJS uses standard DOM events.
- **Rendering**: Prefer `<For>` over `.map()` for lists.
- **Styling**: `style` prop supports signal-based variants (`hover`, `pressed`) similar to the original, but optimized for Solid's reactivity.

## License

MIT
