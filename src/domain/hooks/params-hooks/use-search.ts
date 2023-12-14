import { useContext, useCallback } from 'react';
import { ParamsContextProps, ParamsContext } from './params-context';

export const useSearch = (): [string | undefined, (search: string) => void] => {
  const { params, setParams } = useContext<ParamsContextProps>(ParamsContext);
  const setSearch = useCallback((search: string) => {
    setParams(params => ({
      ...params,
      search,
    }));
  }, []);
  return [params.search, setSearch];
};
