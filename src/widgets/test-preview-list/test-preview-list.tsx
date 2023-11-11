import { useCallback, FC, CSSProperties } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { TestPreview } from 'src/domain/model/test-model';
import { TestPreviewItem } from 'widgets/test-preview-item';

type ListProps = {
  tests: TestPreview[];
  onTestSelect: (test: TestPreview) => void;
};

type RowProps = {
  key: string;
  style: CSSProperties;
  index: number;
};

const ROW_HEIGHT = 32;

export const TestPreviewList: FC<ListProps> = ({ tests, onTestSelect }) => {
  const itemRenderer = useCallback(
    ({ key, style, index }: RowProps) => {
      return (
        <div key={key} style={style}>
          <TestPreviewItem test={tests[index]} onSelect={onTestSelect} />
        </div>
      );
    },
    [tests],
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={tests.length}
          rowHeight={ROW_HEIGHT}
          rowRenderer={itemRenderer}
        />
      )}
    </AutoSizer>
  );
};
