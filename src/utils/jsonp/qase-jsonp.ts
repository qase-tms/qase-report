import {getJsonpResolver} from './jsonp-resolvers';

export function qaseJsonp(data: any): void {
    const callbackId: string | undefined = document.currentScript?.dataset?.callbackId;
    if (!callbackId) {
        throw new Error('No callbackId for jsonp data was found!');
    }
    const resolve = getJsonpResolver(callbackId);
    if(!resolve) {
        throw new Error('No resolver was found!')
    }
    resolve(data);
};