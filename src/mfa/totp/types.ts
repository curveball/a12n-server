import { User } from '../../user/types';

export type TotpDevice = {
    id: number;
    user: User;
    secret: string;
    failures: number;
}

export type NewTotpDevice = Omit<TotpDevice, 'id'|'failures'|'created'>;