import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

type StepsState = Record<
  string,
  {
    opened: boolean;
  }
>;

type StepStateMapper = (stepsState: StepsState) => StepsState;
type StepStateSetter = (stepsState: StepsState | StepStateMapper) => void;

type StepsContextProps = {
  stepsState: StepsState;
  setStepsState: StepStateSetter;
};

const StepsContext = createContext<StepsContextProps>({
  stepsState: {},
  setStepsState: () => {},
});

export const StepsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [stepsState, setStepsState] = useState<StepsState>({});

  const contextValue = useMemo(() => {
    return { stepsState, setStepsState };
  }, [stepsState]);

  return <StepsContext.Provider value={contextValue}>{children}</StepsContext.Provider>;
};

type StepItemState = [{ opened: boolean }, (opened: boolean) => void];

export const useStepsState = (testId: string): StepItemState => {
  const { stepsState, setStepsState } = useContext<StepsContextProps>(StepsContext);
  const toggleStep = useCallback(
    (opened: boolean) => {
      setStepsState(stepsState => ({
        ...stepsState,
        [testId]: {
          opened,
        },
      }));
    },
    [testId],
  );

  return [stepsState[testId] ?? { opened: true }, toggleStep];
};
