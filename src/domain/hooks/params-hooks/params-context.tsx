import { createContext, PropsWithChildren, FC, useState, useMemo, useEffect } from 'react';
import { TabId } from 'domain/model/tabs';

export type Params = {
  tabId?: TabId;
  testId?: string;
  search?: string;
};

type ParamsSetter = (params: Params) => Params;

export type ParamsContextProps = {
  params: Params;
  setParams: (params: Params | ParamsSetter) => void;
};

export const ParamsContext = createContext<ParamsContextProps>({
  params: {},
  setParams: () => {},
});

const decodeUrlParam = (param: string | null) => {
  if (!param) {
    return param;
  }
  return decodeURI(param);
};

export const decodeParams = (urlParams: URLSearchParams): Params => {
  const urlTabId = urlParams.get('tabId') as TabId;
  const urlTestId = urlParams.get('testId');
  const urlSearch = decodeUrlParam(urlParams.get('search'));

  return {
    tabId: Object.values(TabId).includes(urlTabId) ? (urlParams.get('tabId') as TabId) : undefined,
    testId: urlTestId ?? undefined,
    search: urlSearch ?? undefined,
  };
};

const encodeUrlParam = (param: string) => {
  return encodeURI(param.trim());
};

export const encodeParams = (params: Params): string => {
  const searchString = Object.entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeUrlParam(value)}`)
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
