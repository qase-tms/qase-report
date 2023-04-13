import { observer } from 'mobx-react-lite'
import { Drawer, Toolbar } from '@mui/material'
import { PropsWithChildren } from 'react'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  width?: string
}

export const Sidebar = observer(
  ({
    children,
    isOpen,
    onClose,
    width = '40vw',
  }: PropsWithChildren<SidebarProps>) => {
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
