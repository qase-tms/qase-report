import { FC, ReactNode, useState } from 'react';
import ReactSplitPane, { Pane } from 'split-pane-react';
import { Divider } from 'components/divider';
import 'split-pane-react/esm/themes/default.css';

type SizesType = Array<string | number>;

const dividerCss = `
    margin-top: 16px;
`;

type SplitPaneProps = {
  initialSizes: SizesType;
  minSizes: SizesType;
  renderLeft: () => ReactNode;
  renderRight: () => ReactNode;
};

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
      sashRender={() => <Divider css={dividerCss} height="calc(100vh - 66px)" />}
      allowResize
    >
      <Pane minSize={minSizes[0]}>{renderLeft()}</Pane>
      <Pane minSize={minSizes[1]}>{renderRight()}</Pane>
    </ReactSplitPane>
  );
};
