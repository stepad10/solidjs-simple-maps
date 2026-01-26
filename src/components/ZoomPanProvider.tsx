import { createContext, useContext, JSX } from "solid-js";
import { ZoomPanContextType } from "../types";

export const ZoomPanContext = createContext<ZoomPanContextType | undefined>(undefined);

const defaultValue: ZoomPanContextType = {
    x: 0,
    y: 0,
    k: 1,
    transformString: "translate(0 0) scale(1)",
};

interface ZoomPanProviderProps {
    value?: ZoomPanContextType;
    children: JSX.Element;
}

export const ZoomPanProvider = (props: ZoomPanProviderProps) => {
    return <ZoomPanContext.Provider value={props.value || defaultValue}>{props.children}</ZoomPanContext.Provider>;
};

export const useZoomPanContext = (): ZoomPanContextType => {
    const context = useContext(ZoomPanContext);
    if (context === undefined) {
        throw new Error("useZoomPanContext must be used within a ZoomPanProvider");
    }
    return context;
};
