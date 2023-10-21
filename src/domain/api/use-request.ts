import { useState, useEffect } from 'react';

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

export function useRequest<DataType>(request:()=>Promise<DataType>):RequestResult<DataType> {
    const [data, setData] = useState<DataType|null>(null);
    const [status, setStatus] = useState<RequestStatus>(RequestStatus.Idle);
    const [error, setError] = useState<Error|undefined>();
    useEffect(() => {
        setStatus(RequestStatus.Loading);
        request()
        .then((result) => {
            setStatus(RequestStatus.Success);
            setData(result);
        })
        .catch(() => {
            setStatus(RequestStatus.Failed);
            setError(error);
        });
    }, []);
    return {
        data,
        status,
        error
    };
}