import { createContext, PropsWithChildren, FC, useState, useMemo, useEffect } from 'react';
import { TabId } from 'domain/model/tabs';

export type Params = {
  tabId?: TabId;
  testId?: string;
};

export type ParamsContextProps = {
  params: Params;
  setParams: (params: Params) => void;
};

export const ParamsContext = createContext<ParamsContextProps>({
  params: {},
  setParams: () => {},
});

const decodeParams = (urlParams: URLSearchParams): Params => {
  const urlTabId = urlParams.get('tabId') as TabId;
  const urlTestId = urlParams.get('testId');

  return {
    tabId: Object.values(TabId).includes(urlTabId) ? (urlParams.get('tabId') as TabId) : undefined,
    testId: urlTestId ?? undefined,
  };
};

const encodeParams = (params: Params): string => {
  const searchString = Object.entries(params)
    .filter(([key, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return searchString ? `?${searchString}` : '';
};

export const ParamsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [params, setParams] = useState<Params>(decodeParams(new URLSearchParams(location.search)));
  useEffect(() => {
    history.pushState(null, '', encodeParams(params));
  }, [params]);
  const value = useMemo(() => {
    return { params, setParams };
  }, [params]);
  return <ParamsContext.Provider value={value}>{children}</ParamsContext.Provider>;
};
