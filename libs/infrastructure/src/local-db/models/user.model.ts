import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class UserModel extends Model {
    static table = 'users';

    @text('username') username!: string;
    @text('email') email!: string;
    @text('name') name!: string;
    @text('surname') surname!: string;
    @field('active') active!: boolean;
    @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
}
