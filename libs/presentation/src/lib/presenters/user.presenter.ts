// import { Store } from '@reduxjs/toolkit';
import { IUserRepository } from '@rem-web/domain';
import { setUser, clearUser } from '../store/user.slice';
import {AppDispatch} from "../store/store";


export class UserPresenter {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly dispatch: AppDispatch
    ) {}

    public startObservingActiveUser(): () => void {
        const subscription = this.userRepository.observeActiveUser().subscribe((user) => {
            if (user) {
                this.dispatch(setUser(user));
            } else {
                this.dispatch(clearUser());
            }
        });

        return () => subscription.unsubscribe();
    }
}