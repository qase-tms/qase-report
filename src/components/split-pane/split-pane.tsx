import { FC, ReactNode, useState } from 'react';
import ReactSplitPane, { Pane } from 'split-pane-react';
import { Divider } from 'components/divider';
import styled from 'styled-components';
import 'split-pane-react/esm/themes/default.css';

type SizesType = Array<string | number>;

type SplitPaneProps = {
  initialSizes: SizesType;
  minSizes: SizesType;
  renderLeft: () => ReactNode;
  renderRight: () => ReactNode;
};

const Sash = styled.div`
  margin-top: 16px;
`;

export const SplitPane: FC<SplitPaneProps> = ({
  initialSizes,
  minSizes,
  renderLeft,
  renderRight,
}) => {
  const [sizes, setSizes] = useState<SizesType>(initialSizes);

  return (
    <ReactSplitPane
      split="vertical"
      sizes={sizes}
      onChange={setSizes}
      sashRender={() => (
        <Sash>
          <Divider height="calc(100vh - 66px)" />
        </Sash>
      )}
      allowResize
    >
      <Pane minSize={minSizes[0]}>{renderLeft()}</Pane>
      <Pane minSize={minSizes[1]}>{renderRight()}</Pane>
    </ReactSplitPane>
  );
};
