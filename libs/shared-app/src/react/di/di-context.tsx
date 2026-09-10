import { createContext, useContext } from 'react';
import {AppDependencies} from "@rem-web/presentation";
// import { AppDependencies } from 'libs/presentation/src';

export const DIContext = createContext<AppDependencies | null>(null);

export const useDI = (): AppDependencies => {
    const context = useContext(DIContext);
    if (!context) throw new Error('useDI must be used within DIProvider');
    return context;
};