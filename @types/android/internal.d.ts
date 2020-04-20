import * as internal from '../base/internal';

export interface AppViewModel extends internal.AppViewModel {
    import?: string[];
    variable?: { name: string; type: string }[];
}