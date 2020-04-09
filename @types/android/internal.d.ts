import { AppViewModel } from '../base/internal';

export interface AppViewModelAndroid extends AppViewModel {
    import?: string[];
    variable?: { name: string; type: string }[];
}