import React, { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { FrontAppDependencies, store, UserPresenter } from '@rem-web/presentation';
import { DIContext, AuthBoundary } from "@rem-web/shared-app";

import { LoginScreen } from '../components/auth/LoginScreen';
import { DashboardScreen } from '../components/auth/DashboardScreen';
import { setupFrontDependencies } from '../di/front.di';

const UnauthorizedRoutes = () => (
    <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
);

const AuthorizedRoutes = () => (
    <Routes>
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
);

const StateSyncManager: React.FC<{ presenter: UserPresenter }> = ({ presenter }) => {
    useEffect(() => {
        const unsubscribe = presenter.startObservingActiveUser();
        return () => unsubscribe();
    }, [presenter]);

    return null;
};

export const App: React.FC = () => {
    const [dependencies, setDependencies] = useState<FrontAppDependencies | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let disposeScope: (() => void) | null = null;
        let isCancelled = false;

        setupFrontDependencies()
            .then(({ dependencies, dispose }) => {
                if (isCancelled) {
                    dispose();
                    return;
                }
                disposeScope = dispose;
                setDependencies(dependencies);
            })
            .catch((err) => {
                if (!isCancelled) {
                    console.error('[App Bootstrap Failed]:', err);
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
            });

        return () => {
            isCancelled = true;
            if (disposeScope) {
                disposeScope();
            }
        };
    }, []);

    if (error) {
        return <div>Failed to initialize application: {error.message}</div>;
    }

    if (!dependencies) {
        return <div>Initializing application...</div>;
    }

    return (
        <ReduxProvider store={store}>
            <DIContext.Provider value={dependencies}>
                <StateSyncManager presenter={dependencies.userPresenter} />
                <BrowserRouter>
                    <AuthBoundary
                        authorizedLayout={<AuthorizedRoutes />}
                        unauthorizedLayout={<UnauthorizedRoutes />}
                    />
                </BrowserRouter>
            </DIContext.Provider>
        </ReduxProvider>
    );
};

export default App;