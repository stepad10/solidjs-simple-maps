/// <reference types="vitest" />
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        solidPlugin(),
        dts({
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "SolidSimpleMaps",
            fileName: "index",
        },
        sourcemap: true,
        rollupOptions: {
            external: ["solid-js", "solid-js/web", "d3-geo", "d3-selection", "d3-zoom", "topojson-client"],
            output: {
                globals: {
                    "solid-js": "Solid",
                    "solid-js/web": "SolidWeb",
                    "d3-geo": "d3",
                    "d3-selection": "d3",
                    "d3-zoom": "d3",
                    "topojson-client": "topojson",
                },
            },
        },
    },
    test: {
        environment: "happy-dom",
        server: {
            deps: {
                inline: [/solid-js/],
            },
        },
        isolate: false,
        setupFiles: ["./tests/setup.ts"],
    },
});
