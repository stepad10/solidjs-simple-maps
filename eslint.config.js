import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    {
        ignores: ["dist", "node_modules", "coverage"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        ...solid.configs["flat/typescript"], // Use flat config specifically if available, or adapt
        // If solid plugin doesn't fully support flat config yet, we might need manual setup, but let's try this standard approach for v9
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "no-console": "warn",
            "no-debugger": "warn",
        },
    },
    prettier, // Must serve as the last object to override other configs
);
