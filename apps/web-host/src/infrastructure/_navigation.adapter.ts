// apps/web-host/src/infrastructure/_navigation.adapter.ts
import { INavigationService } from '@rem-web/presentation';
import { NavigateFunction } from 'react-router-dom';

export class ReactRouterNavigationAdapter implements INavigationService {
    constructor(private navigate: NavigateFunction) {}

    navigateToModule(moduleUuid: string) {
        this.navigate(`/modules/${moduleUuid}`);
    }

    navigateBack(): void {
    }

    resetToAuth(): void {
    }
    // ...
}