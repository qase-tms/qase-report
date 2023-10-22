import { useState, useEffect, DependencyList } from 'react';

export enum RequestStatus {
    Idle='idle',
    Loading='loading',
    Success='success',
    Failed='failed'
};

export type RequestResult<DataType> = {
    data: DataType|null;
    status:RequestStatus;
    error?: Error
};

export function useRequest<DataType>(request:(signal?: AbortSignal)=>Promise<DataType>, dependencies: DependencyList):RequestResult<DataType> {
    const [data, setData] = useState<DataType|null>(null);
    const [status, setStatus] = useState<RequestStatus>(RequestStatus.Idle);
    const [error, setError] = useState<Error|undefined>();
    useEffect(() => {
        const abortContoller = new AbortController();
        setStatus(RequestStatus.Loading);
        request(abortContoller.signal)
        .then((result) => {
            setStatus(RequestStatus.Success);
            setData(result);
        })
        .catch(() => {
            setStatus(RequestStatus.Failed);
            setError(error);
        });
        return () => {
            abortContoller.abort();
            setStatus(RequestStatus.Idle);
        };
    }, [...dependencies, request]);
    return {
        data,
        status,
        error
    };
}