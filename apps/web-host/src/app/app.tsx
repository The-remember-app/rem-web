import React, { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { store, UserPresenter } from '@rem-web/presentation';
import { AuthUserUseCase } from '@rem-web/use-cases';
import { WatermelonUserRepository, WebWorkerBridge, database } from '@rem-web/infrastructure';
import { DIContext } from "@rem-web/shared-app";

import SyncWorker from '../worker/sync.worker?worker';
import { LoginScreen } from '../features/auth/LoginScreen';

// Временный заглушечный экран для проверки успешной авторизации
const DashboardScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-50">
            <h1 className="text-3xl font-bold text-green-700 mb-2">Dashboard</h1>
            <p className="text-gray-600">Авторизация прошла успешно!</p>
        </div>
    );
};

export const App: React.FC = () => {
    const dependencies = useMemo(() => {
        // 1. Создаем реальный экземпляр воркера
        const workerInstance = new SyncWorker();
        const workerBridge = new WebWorkerBridge(workerInstance);

        // 2. Инфраструктура и UseCases
        const userRepository = new WatermelonUserRepository(database);
        const authUserUseCase = new AuthUserUseCase(userRepository, workerBridge);

        // 3. Презентеры (передаем dispatch)
        const userPresenter = new UserPresenter(userRepository, store.dispatch);

        return {
            userRepository,
            authUserUseCase, // Ключ совпадает с тем, что ждет LoginScreen
            userPresenter
        };
    }, []);

    return (
        <ReduxProvider store={store}>
            <DIContext.Provider value={dependencies}>
                {/* Оборачиваем дерево в BrowserRouter */}
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/dashboard" element={<DashboardScreen />} />
                        {/* Редирект по умолчанию на экран логина */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </BrowserRouter>
            </DIContext.Provider>
        </ReduxProvider>
    );
};

export default App;