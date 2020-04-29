
import * as application from './application';

export interface UserSettings extends application.UserSettings {
    framesPerSecond: number;
    supportNegativeLeftTop: boolean;
    showAttributes: boolean;
    insertSpaces: number;
    autoCloseOnWrite: boolean;
    outputDirectory: string;
    resolutionScreenWidth?: number;
    resolutionScreenHeight?: number;
}

export interface ControllerSettings extends application.ControllerSettings {
    layout: {
        pathName: string;
        fileExtension: string;
        baseTemplate: string;
    };
    directory: {
        string: string;
        font: string;
        image: string;
        video: string;
        audio: string;
    };
    style: {
        inputBorderColor: string;
        inputBackgroundColor: string;
        inputColorBorderColor: string;
        meterForegroundColor?: string;
        meterBackgroundColor?: string;
        progressForegroundColor?: string;
        progressBackgroundColor?: string;
    };
    svg: {
        enabled: boolean;
    };
    unsupported: {
        cascade: Set<string>;
        excluded: Set<string>;
        tagName: Set<string>;
    };
    precision: {
        standardFloat: number;
    };
    deviations: {
        textMarginBoundarySize: number;
    };
}