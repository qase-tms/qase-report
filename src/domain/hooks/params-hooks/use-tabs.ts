import { ParamsContextProps, ParamsContext } from './params-context';
import { TabId } from 'domain/model/tabs';
import { useContext, useCallback } from 'react';

export const useTabs = (): [TabId | undefined, (tabId: TabId) => void] => {
  const { params, setParams } = useContext<ParamsContextProps>(ParamsContext);
  const setTab = useCallback((tabId: TabId) => {
    setParams({
      tabId: tabId,
    });
  }, []);
  return [params.tabId, setTab];
};
