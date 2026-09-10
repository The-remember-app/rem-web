import { useEffect } from 'react';
import {useDI} from "../di/di-context";
// import { useDI } from

export const useUserSync = () => {
    const { userPresenter } = useDI();

    useEffect(() => {
        // Вся логика подписок и Redux скрыта внутри чистого презентера
        const unsubscribe = userPresenter.startObservingActiveUser();

        // React отвечает только за отписку при размонтировании компонента (unmount)
        return () => unsubscribe();
    }, [userPresenter]);
};