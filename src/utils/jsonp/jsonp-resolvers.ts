type Listener = (data: any) => void;
export type JsonpListeners = Record<string, Listener>

const jsonpResolvers: JsonpListeners = {};

export const registerJsonpResolver = (callbackId: string, resolver: Listener):void => {
    jsonpResolvers[callbackId] = resolver;
}

export const unregisterJsonpResolver = (callbackId: string) => {
    delete jsonpResolvers[callbackId];
}

export const getJsonpResolver = (callbackId: string):Listener|undefined => {
    return jsonpResolvers[callbackId];
}
