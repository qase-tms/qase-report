import { FC } from 'react';
import logoSrc from './resources/logo.svg';

export const Logo: FC = () => {
    return (
       <img src={logoSrc} />
    );
};