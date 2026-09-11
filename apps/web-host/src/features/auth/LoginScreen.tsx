import React, { useState, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useDI } from '@rem-web/shared-app'; // Берем хук из общего shared мода

export const LoginScreen: React.FC = () => {
    // Достаем authUserUseCase (имя должно точно совпадать с App.tsx)
    const { authUserUseCase } = useDI();
    // const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Вызываем UseCase авторизации
            await authUserUseCase.execute({ username, password });

            // 2. Успех: переходим на экран Dashboard
            // navigate('/dashboard', { replace: true });
        } catch (error) {
            // 3. Заглушка для ошибок
            console.error('[LoginScreen] Auth failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-xl font-semibold text-blue-600 animate-pulse">
                    Performing authentication, please wait...
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-white rounded-xl shadow-md w-96 flex flex-col gap-4"
            >
                <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    className="mt-4 p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    );
};