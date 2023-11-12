import {
  useContext,
  createContext,
  PropsWithChildren,
  FC,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

export enum TabId {
  Tests = 'tests',
  Timeline = 'timeline',
  Issues = 'issues',
}

type Params = {
  tabId?: TabId;
  testId?: string;
};

type ParamsContextProps = {
  params: Params;
  setParams: (params: Params) => void;
};

const ParamsContext = createContext<ParamsContextProps>({
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

export const useTabs = (): [TabId | undefined, (tabId: TabId) => void] => {
  const { params, setParams } = useContext<ParamsContextProps>(ParamsContext);
  const setTab = useCallback((tabId: TabId) => {
    setParams({
      tabId: tabId,
    });
  }, []);
  return [params.tabId, setTab];
};

export const useQaseTestId = (): [string | undefined, (testId: string) => void] => {
  const { params, setParams } = useContext<ParamsContextProps>(ParamsContext);
  const setTestId = useCallback(
    (testId: string) => {
      setParams({
        tabId: params.tabId,
        testId,
      });
    },
    [params],
  );
  return [params.testId, setTestId];
};
