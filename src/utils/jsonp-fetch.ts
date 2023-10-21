type JsonpListeners = Record<string, (data: any) => void>

const jsonpResolvers: JsonpListeners = {};

export function qaseJsonp(data: any): void {
    const callbackId: string | undefined = document.currentScript?.dataset?.callbackId;
    if (!callbackId) {
        throw new Error('No callbackId for jsonp data found');
    }
    const resolve = jsonpResolvers[callbackId];
    resolve(data);
}



export function jsonpFetch<DataType>(path: string): Promise<DataType> {
    const script = document.createElement('script');
    return new Promise((resolve, reject) => {
        const callbackId = `${path}#${Math.random().toFixed(10)}_${Date.now()}`;
        script.dataset.callbackId = callbackId;
        jsonpResolvers[callbackId] = resolve;
        script.type = 'text/javascript';
        script.async = true;
        script.onerror = reject;
        script.src = path;
        document.body.appendChild(script);
    }).then((data: any) => {
        document.body.removeChild(script);
        delete jsonpResolvers[path];
        return Promise.resolve(data as DataType);
    }, (error) => {
        document.body.removeChild(script);
        delete jsonpResolvers[path];
        return Promise.reject(error);
    });
}