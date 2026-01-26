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
npm install solidjs-simple-maps solid-js d3-geo d3-selection d3-zoom topojson-client @solidjs/meta
```

## Basic Usage

```jsx
import { ComposableMap, Geographies, Geography } from 'solidjs-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
  return (
    <ComposableMap>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography 
              geography={geo} 
              fill="#DDD" 
              stroke="#FFF" 
            />
          ))
        }
      </Geographies>
    </ComposableMap>
  );
}
```

## Advanced Usage

### SEO & Metadata

You can use the `MapWithMetadata` wrapper to automatically inject SEO tags into the head of your document using `@solidjs/meta`.

```jsx
import { MapWithMetadata, Geographies, Geography, MetaProvider } from 'solidjs-simple-maps';

const geoUrl = "...";

function App() {
  return (
    <MetaProvider>
      <MapWithMetadata
        metadata={{
          title: "My Awesome Interactive Map",
          description: "A detailed map of the world created with SolidJS.",
          keywords: ["map", "solidjs", "world"],
          author: "Me",
        }}
        enableOpenGraph={true}
        enableTwitterCards={true}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) => geographies.map(geo => <Geography geography={geo} />)}
        </Geographies>
      </MapWithMetadata>
    </MetaProvider>
  );
}
```

### Handling Events & Errors

```jsx
<Geographies 
  geography={geoUrl}
  onGeographyError={(error) => console.error("Failed to load map:", error)}
>
  {({ geographies }) =>
    geographies.map((geo) => (
      <Geography
        geography={geo}
        onClick={(e) => alert(`You clicked ${geo.properties.name}`)}
        style={{
          default: { fill: "#D6D6DA", outline: "none" },
          hover: { fill: "#F53", outline: "none" },
          pressed: { fill: "#E42", outline: "none" },
        }}
      />
    ))
  }
</Geographies>
```

## Components

- **`ComposableMap`**: The root provider component.
- **`Geographies`**: Fetches and prepares map data.
- **`Geography`**: Renders an individual SVG path for a feature.
- **`ZoomableGroup`**: Wraps content to provide zoom/pan behavior.
- **`Marker`**: Renders a point at a specific coordinate (lon, lat).
- **`Line`**: Renders a line between two coordinates.
- **`Annotation`**: Renders a text annotation with a connector line.
- **`Graticule`**: Renders grid lines (lat/long).
- **`Sphere`**: Renders a background sphere (outline of the globe).

## License

MIT
