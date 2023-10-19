import { FC } from 'react';
import { AppBar, Toolbar } from '@mui/material';
import logoSrc from './resources/logo.svg';

export const Header: FC = () => {
    return (
        <AppBar
            position="fixed"
            sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
            <Toolbar variant={'dense'}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <img src={logoSrc} />
                    <span style={{ fontSize: '14px', color: '#32425F40'}}>|</span>
                    <span style={{ fontSize: '14px' }}>Report</span>
                </div>
            </Toolbar>
        </AppBar>
    )
}