import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@rem-web/presentation'; // Путь к экспортируемому RootState

export interface AuthBoundaryProps {
    authorizedLayout: ReactNode;
    unauthorizedLayout: ReactNode;
    // Опциональный лоадер на момент инициализации БД (если стейт null)
    loaderLayout?: ReactNode;
}

export const AuthBoundary: React.FC<AuthBoundaryProps> = ({
                                                              authorizedLayout,
                                                              unauthorizedLayout,
                                                              loaderLayout = null
                                                          }) => {
    // Читаем реактивное состояние прямо из Redux
    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

    // В идеале в стейте еще нужно поле isInitialized для первичной загрузки,
    // но для начала хватит жесткого переключения:

    if (isAuthenticated) {
        return <>{authorizedLayout}</>;
    }

    return <>{unauthorizedLayout}</>;
};