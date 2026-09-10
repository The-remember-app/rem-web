// apps/web-host/src/app/Provider.tsx
import { createContext, useContext } from 'react';
import {AppContainer} from "@rem-web/infrastructure";
// import { AppContainer } from '@rem-web/infrastructure';

const DIContext = createContext<AppContainer | null>(null);

export const useDI = () => {
    const container = useContext(DIContext);
    if (!container) throw new Error('DI Container not initialized');
    return container;
};

// В компоненте:
// const { authUseCase } = useDI();
// authUseCase.execute(...);