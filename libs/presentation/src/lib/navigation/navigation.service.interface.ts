// libs/presentation/src/lib/navigation/navigation.service.interface.ts
export interface INavigationService {
    navigateToModule(moduleUuid: string): void;
    navigateBack(): void;
    resetToAuth(): void;
}
