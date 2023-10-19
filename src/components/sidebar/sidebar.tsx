import { FC } from 'react';
import { observer } from 'mobx-react-lite'
import { Drawer, Toolbar } from '@mui/material'
import { PropsWithChildren } from 'react'

type SidebarProps = PropsWithChildren<{
  isOpen: boolean,
  onClose: () => void,
  width?: string
}>

export const Sidebar: FC<SidebarProps> = observer(
  ({
    children,
    isOpen,
    onClose,
    width = '40vw',
  }) => {
    return (
      <Drawer
        anchor={'right'}
        open={isOpen}
        onClose={onClose}
        sx={{
          width: width || '40vw',
          [`& .MuiDrawer-paper`]: { width: width, boxSizing: 'border-box' },
        }}
      >
        <Toolbar variant={'dense'} />
        {children}
      </Drawer>
    )
  }
)
