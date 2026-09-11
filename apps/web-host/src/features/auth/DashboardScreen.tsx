import React from 'react';
import { useDI } from '@rem-web/shared-app';

export const DashboardScreen: React.FC = () => {
    const { logoutUserUseCase } = useDI();

    const handleLogout = async () => {
        await logoutUserUseCase.execute();
        // Как только юзкейс удалит запись из WatermelonDB,
        // UserPresenter поймает пустое значение, обновит Redux,
        // и AuthBoundary автоматически выкинет пользователя на UnauthorizedRoutes
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-50">
            <h1 className="text-3xl font-bold text-green-700 mb-2">Dashboard</h1>
            <p className="text-gray-600 mb-6">Авторизация прошла успешно!</p>

            <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
                Log Out
            </button>
        </div>
    );
};