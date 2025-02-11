import { User } from '../../types.ts';

export type TotpDevice = {
    user: User;
    secret: string;
    failures: number;
}

export type NewTotpDevice = Omit<TotpDevice, 'id'|'failures'|'created'>;
