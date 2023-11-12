import { useContext, useCallback } from 'react';
import { ParamsContextProps, ParamsContext } from './params-context';

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
