import { generateId } from 'utils/generate-id';
import { registerJsonpResolver, unregisterJsonpResolver } from './jsonp-resolvers';

export function jsonpFetch<DataType>(path: string): Promise<DataType> {
    const script = document.createElement('script');
    const callbackId = generateId(path);
    return new Promise((resolve, reject) => {
        script.setAttribute('data-callback-id', callbackId);
        registerJsonpResolver(callbackId, resolve);
        script.type = 'text/javascript';
        script.async = true;
        script.onerror = reject;
        script.src = path;
        document.body.appendChild(script);
    }).then((data: any) => {
        document.body.removeChild(script);
        unregisterJsonpResolver(callbackId);
        return Promise.resolve(data as DataType);
    }, (error) => {
        document.body.removeChild(script);
        unregisterJsonpResolver(callbackId);
        return Promise.reject(error);
    });
}