import { createContext, useContext } from 'react';
import {FrontAppDependencies} from "@rem-web/presentation";
// import { AppDependencies } from 'libs/presentation/src';

export const DIContext = createContext<FrontAppDependencies | null>(null);

export const useDI = (): FrontAppDependencies => {
    const context = useContext(DIContext);
    if (!context) throw new Error('useDI must be used within DIProvider');
    return context;
};