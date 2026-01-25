import { render } from 'solid-js/web';
import { Suspense } from 'solid-js';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker,
    Line,
    Annotation,
    Graticule,
    Sphere
} from '../src';
import { createCoordinates } from '../src/types';

const App = () => {
    const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <h1>SolidJS Simple Maps</h1>
            <Suspense fallback={<div>Loading map...</div>}>
                <ComposableMap>
                    <ZoomableGroup>
                        <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
                        <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        geography={geo}
                                        fill="#D6D6DA"
                                        stroke="#FFFFFF"
                                        style={{
                                            hover: { fill: "#F53" },
                                            pressed: { fill: "#E42" }
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        <Marker coordinates={[-74.006, 40.7128]}>
                            <circle r={8} fill="#F00" stroke="#fff" stroke-width={2} />
                            <text text-anchor="middle" y={-10} style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}>
                                London
                            </text>
                        </Marker>

                        <Line
                            from={[-74.006, 40.7128]}
                            to={[2.3522, 48.8566]}
                            stroke="#F53"
                            strokeWidth={2}
                        />

                        <Annotation
                            subject={[2.3522, 48.8566]}
                            dx={-90}
                            dy={-30}
                            connectorProps={{
                                stroke: "#FF5533",
                                strokeWidth: 3,
                                strokeLinecap: "round"
                            }}
                        >
                            <text x="-8" text-anchor="end" alignment-baseline="middle" fill="#F53">
                                Paris
                            </text>
                        </Annotation>

                    </ZoomableGroup>
                </ComposableMap>
            </Suspense>
        </div >
    );
};

render(() => <App />, document.getElementById('root')!);
