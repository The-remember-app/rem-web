// import { Store } from '@reduxjs/toolkit';
import { IUserRepository } from '@rem-web/domain';
import { setUser, clearUser } from '../store/user.slice';
import {AppDispatch} from "../store/store";
import {UserDtoMapper} from "../mappers/user-dto.mapper";


export class UserPresenter {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly dispatch: AppDispatch
    ) {}

    public startObservingActiveUser(): () => void  {
        const subscription = this.userRepository.observeActiveUser().subscribe((user) => {
            console.log("DB  startObservingActiveUser gets");
            if (user && user.active) {
                const userDto =  UserDtoMapper.toDTO(user);

                // Отправляем в Redux
                this.dispatch(setUser(userDto));
                // this.dispatch(setUser(auth));
            } else {
                this.dispatch(clearUser());
            }
        });

        return () => subscription.unsubscribe();
    }
}