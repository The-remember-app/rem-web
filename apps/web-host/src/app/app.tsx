import React, {useEffect, useMemo, useState} from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import {AppDependencies, store, UserPresenter} from '@rem-web/presentation';
import { AuthUserUseCase, LogoutUserUseCase } from '@rem-web/use-cases';
import { RxDbUserRepository, WebWorkerBridge, initDatabase } from '@rem-web/infrastructure';
import { DIContext, AuthBoundary } from "@rem-web/shared-app";

import SyncWorker from '../worker/sync.worker?worker';
import { LoginScreen } from '../features/auth/LoginScreen';
import { DashboardScreen } from '../features/auth/DashboardScreen';
import {IUserRepository} from "@rem-web/domain";

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

// Компонент, запускающий синхронизацию Презентера с Редаксом

const StateSyncManager: React.FC<{ presenter: UserPresenter }> = ({ presenter }) => {

    useEffect(() => {

        const unsubscribe = presenter.startObservingActiveUser();

        return () => unsubscribe();

    }, [presenter]);

    return null;

};
export const App: React.FC = () => {
    const [dependencies, setDependencies] = useState<AppDependencies | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        let worker: Worker | null = null;

        const bootstrap = async () => {
            try {
                console.log('[App Bootstrap] Starting...');



                if (cancelled) {
                    return;
                }

                console.log('[App Bootstrap] DB initialized');

                worker = new SyncWorker();

                worker.addEventListener('error', (event) => {
                    console.error('[SyncWorker] error:', event);
                });

                worker.addEventListener('messageerror', (event) => {
                    console.error('[SyncWorker] messageerror:', event);
                });

                console.log('[App Bootstrap] Worker created');

                const db = await initDatabase();
                const userRepository =
                    new RxDbUserRepository(db);

                const workerBridge = new WebWorkerBridge(worker);


                const authUserUseCase =
                    new AuthUserUseCase(
                        userRepository,
                        workerBridge
                    );

                const logoutUserUseCase =
                    new LogoutUserUseCase(userRepository);

                const userPresenter =
                    new UserPresenter(
                        userRepository,
                        store.dispatch
                    );

                if (cancelled) {
                    worker.terminate();
                    return;
                }

                setDependencies({
                    userRepository,
                    authUserUseCase,
                    logoutUserUseCase,
                    userPresenter,
                });

            } catch (error) {
                if (!cancelled) {
                    console.error(
                        '[App Bootstrap] Failed:',
                        error
                    );

                    setError(
                        error instanceof Error
                            ? error
                            : new Error(String(error))
                    );
                }
            }
        };

        bootstrap();

        return () => {
            cancelled = true;

            if (worker) {
                console.log('[App Bootstrap] Terminating worker');
                worker.terminate();
                worker = null;
            }
        };
    }, []);

    if (error) {
        return (
            <div>
                Failed to initialize application:
                {error.message}
            </div>
        );
    }

    if (!dependencies) {
        return (
            <div>
                Initializing...
            </div>
        );
    }

    return (
        <ReduxProvider store={store}>
            <DIContext.Provider value={dependencies}>
                <StateSyncManager
                    presenter={dependencies.userPresenter}
                />

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

//
//
// export const App: React.FC = () => {
//
//     const dependencies = useMemo(() => {
//
//         const workerInstance = new SyncWorker();
//
//         const workerBridge = new WebWorkerBridge(workerInstance);
//
//
//
//         const userRepository = new WatermelonUserRepository(database);
//
//
//
// // Use Cases
//
//         const authUserUseCase = new AuthUserUseCase(userRepository, workerBridge);
//
//         const logoutUserUseCase = new LogoutUserUseCase(userRepository);
//
//
//
//         const userPresenter = new UserPresenter(userRepository, store.dispatch);
//
//
//
//         return {
//
//             userRepository,
//
//             authUserUseCase,
//
//             logoutUserUseCase,
//
//             userPresenter
//
//         };
//
//     }, []);
//
//
//
//     return (
//
//         <ReduxProvider store={store}>
//
//             <DIContext.Provider value={dependencies}>
//
//                 {/* Запускаем слушатель БД */}
//
//                 <StateSyncManager presenter={dependencies.userPresenter} />
//
//
//
//                 <BrowserRouter>
//
//                     {/* Разделяемый шлюз переключает целые графы навигации */}
//
//                     <AuthBoundary
//
//                         authorizedLayout={<AuthorizedRoutes />}
//
//                         unauthorizedLayout={<UnauthorizedRoutes />}
//
//                     />
//
//                 </BrowserRouter>
//
//             </DIContext.Provider>
//
//         </ReduxProvider>
//
//     );
//
// };



// export default App;

