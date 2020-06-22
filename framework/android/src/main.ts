import Application from './application';
import Controller from './controller';
import File from './file';
import Resource from './resource';
import View from './view';

import Accessibility from './extensions/accessibility';
import Column from './extensions/column';
import CssGrid from './extensions/cssgrid';
import External from './extensions/external';
import Flexbox from './extensions/flexbox';
import Grid from './extensions/grid';
import List from './extensions/list';
import Relative from './extensions/relative';
import Sprite from './extensions/sprite';
import Substitute from './extensions/substitute';
import Table from './extensions/table';
import VerticalAlign from './extensions/verticalalign';
import WhiteSpace from './extensions/whitespace';

import ConstraintGuideline from './extensions/constraint/guideline';

import DelegateBackground from './extensions/delegate/background';
import DelegateMaxWidthHeight from './extensions/delegate/max-width-height';
import DelegateNegativeX from './extensions/delegate/negative-x';
import DelegatePositiveX from './extensions/delegate/positive-x';
import DelegatePercent from './extensions/delegate/percent';
import DelegateRadioGroup from './extensions/delegate/radiogroup';
import DelegateScrollBar from './extensions/delegate/scrollbar';

import ResourceBackground from './extensions/resource/background';
import ResourceData from './extensions/resource/data';
import ResourceDimens from './extensions/resource/dimens';
import ResourceFonts from './extensions/resource/fonts';
import ResourceIncludes from './extensions/resource/includes';
import ResourceStrings from './extensions/resource/strings';
import ResourceStyles from './extensions/resource/styles';
import ResourceSvg from './extensions/resource/svg';

import * as constant from './lib/constant';
import * as enumeration from './lib/enumeration';
import * as util from './lib/util';
import * as customization from './lib/customization';

import SETTINGS from './settings';

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID;

let initialized = false;
let application: Application<View>;
let file: File<View>;

function autoClose() {
    if (initialized && !application.initializing && !application.closed && application.userSettings.autoCloseOnWrite) {
        application.finalize();
        return true;
    }
    return false;
}

function createAssetsOptions(options?: FileUniversalOptions, directory?: string, filename?: string): FileUniversalOptions {
    return {
        ...options,
        directory,
        filename
    };
}

const checkApplication = (main: Application<View>): main is Application<View> => initialized && (main.closed || autoClose());

const lib = {
    constant,
    customization,
    enumeration,
    util
};

const appBase: squared.base.AppFramework<View> = {
    base: {
        Controller,
        File,
        Resource,
        View
    },
    extensions: {
        Accessibility,
        Column,
        CssGrid,
        External,
        Flexbox,
        Grid,
        List,
        Relative,
        Sprite,
        Substitute,
        Table,
        VerticalAlign,
        WhiteSpace,
        constraint: {
            Guideline: ConstraintGuideline
        },
        delegate: {
            Background: DelegateBackground,
            MaxWidthHeight: DelegateMaxWidthHeight,
            NegativeX: DelegateNegativeX,
            Percent: DelegatePercent,
            PositiveX: DelegatePositiveX,
            RadioGroup: DelegateRadioGroup,
            ScrollBar: DelegateScrollBar
        },
        resource: {
            Background: ResourceBackground,
            Data: ResourceData,
            Dimens: ResourceDimens,
            Fonts: ResourceFonts,
            Includes: ResourceIncludes,
            Strings: ResourceStrings,
            Styles: ResourceStyles,
            Svg: ResourceSvg
        }
    },
    lib,
    system: {
        customize(build: number, widget: string, options: {}) {
            if (customization.API_ANDROID[build]) {
                const assign = customization.API_ANDROID[build].assign;
                if (assign[widget]) {
                    Object.assign(assign[widget], options);
                }
                else {
                    assign[widget] = options;
                }
                return assign[widget];
            }
            return undefined;
        },
        addXmlNs(name: string, uri: string) {
            constant.XMLNS_ANDROID[name] = uri;
        },
        copyLayoutAllXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.layoutAllToXml(application.layouts, createAssetsOptions(options, directory));
            }
        },
        copyResourceAllXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceAllToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceStringXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceStringToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceArrayXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceStringArrayToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceFontXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceFontToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceColorXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceColorToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceStyleXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceStyleToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceDimenXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceDimenToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceDrawableXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceDrawableToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceAnimXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceAnimToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceDrawableImage(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceDrawableImageToString(createAssetsOptions(options, directory));
            }
        },
        copyResourceRawVideo(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceRawVideoToString(createAssetsOptions(options, directory));
            }
        },
        copyResourceRawAudio(directory: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceRawAudioToString(createAssetsOptions(options, directory));
            }
        },
        saveLayoutAllXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.layoutAllToXml(application.layouts, createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-layouts'));
            }
        },
        saveResourceAllXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceAllToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-resources'));
            }
        },
        saveResourceStringXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceStringToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-string'));
            }
        },
        saveResourceArrayXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceStringArrayToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-array'));
            }
        },
        saveResourceFontXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceFontToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-font'));
            }
        },
        saveResourceColorXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceColorToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-color'));
            }
        },
        saveResourceStyleXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceStyleToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-style'));
            }
        },
        saveResourceDimenXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceDimenToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-dimen'));
            }
        },
        saveResourceDrawableXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceDrawableToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-drawable'));
            }
        },
        saveResourceAnimXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceAnimToXml(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-anim'));
            }
        },
        saveResourceDrawableImage(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceDrawableImageToString(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-drawable-image'));
            }
        },
        saveResourceRawVideo(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceRawVideoToString(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-raw-video'));
            }
        },
        saveResourceRawAudio(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication(application)) {
                file.resourceRawAudioToString(createAssetsOptions(options, undefined, filename || application.userSettings.outputArchiveName + '-raw-audio'));
            }
        },
        writeLayoutAllXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.layoutAllToXml(application.layouts, options) : {};
        },
        writeResourceAllXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceAllToXml(options) : {};
        },
        writeResourceStringXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceStringToXml(options) : [];
        },
        writeResourceArrayXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceStringArrayToXml(options) : [];
        },
        writeResourceFontXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceFontToXml(options) : [];
        },
        writeResourceColorXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceColorToXml(options) : [];
        },
        writeResourceStyleXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceStyleToXml(options) : [];
        },
        writeResourceDimenXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceDimenToXml(options) : [];
        },
        writeResourceDrawableXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceDrawableToXml(options) : [];
        },
        writeResourceAnimXml(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceAnimToXml(options) : [];
        },
        writeResourceDrawableImage(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceDrawableImageToString(options) : [];
        },
        writeResourceRawVideo(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceRawVideoToString(options) : [];
        },
        writeResourceRawAudio(options?: FileUniversalOptions) {
            return checkApplication(application) ? file.resourceRawAudioToString(options) : [];
        }
    },
    create() {
        const EN = squared.base.lib.constant.EXT_NAME as StringSafeMap;
        const EA = constant.EXT_ANDROID;
        application = new Application<View>(framework, View, Controller, Resource, squared.base.ExtensionManager);
        file = new File();
        application.resourceHandler.fileHandler = file;
        Object.assign(application.builtInExtensions, {
            [EN.TABLE]: new Table(EN.TABLE, framework, undefined, ['TABLE']),
            [EN.LIST]: new List(EN.LIST, framework, undefined, ['DIV', 'UL', 'OL', 'DL']),
            [EN.GRID]: new Grid(EN.GRID, framework, undefined, ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET']),
            [EN.CSS_GRID]: new CssGrid(EN.CSS_GRID, framework),
            [EN.FLEXBOX]: new Flexbox(EN.FLEXBOX, framework),
            [EN.COLUMN]: new Column(EN.COLUMN, framework),
            [EN.SPRITE]: new Sprite(EN.SPRITE, framework),
            [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
            [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
            [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
            [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
            [EA.EXTERNAL]: new External(EA.EXTERNAL, framework),
            [EA.SUBSTITUTE]: new Substitute(EA.SUBSTITUTE, framework),
            [EA.DELEGATE_BACKGROUND]: new DelegateBackground(EA.DELEGATE_BACKGROUND, framework),
            [EA.DELEGATE_MAXWIDTHHEIGHT]: new DelegateMaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
            [EA.DELEGATE_NEGATIVEX]: new DelegateNegativeX(EA.DELEGATE_NEGATIVEX, framework),
            [EA.DELEGATE_PERCENT]: new DelegatePercent(EA.DELEGATE_PERCENT, framework),
            [EA.DELEGATE_POSITIVEX]: new DelegatePositiveX(EA.DELEGATE_POSITIVEX, framework),
            [EA.DELEGATE_RADIOGROUP]: new DelegateRadioGroup(EA.DELEGATE_RADIOGROUP, framework),
            [EA.DELEGATE_SCROLLBAR]: new DelegateScrollBar(EA.DELEGATE_SCROLLBAR, framework),
            [EA.RESOURCE_BACKGROUND]: new ResourceBackground(EA.RESOURCE_BACKGROUND, framework),
            [EA.RESOURCE_DATA]: new ResourceData(EA.RESOURCE_DATA, framework),
            [EA.RESOURCE_DIMENS]: new ResourceDimens(EA.RESOURCE_DIMENS, framework),
            [EA.RESOURCE_FONTS]: new ResourceFonts(EA.RESOURCE_FONTS, framework),
            [EA.RESOURCE_INCLUDES]: new ResourceIncludes(EA.RESOURCE_INCLUDES, framework),
            [EA.RESOURCE_STRINGS]: new ResourceStrings(EA.RESOURCE_STRINGS, framework),
            [EA.RESOURCE_STYLES]: new ResourceStyles(EA.RESOURCE_STYLES, framework),
            [EA.RESOURCE_SVG]: new ResourceSvg(EA.RESOURCE_SVG, framework),
            [EA.CONSTRAINT_GUIDELINE]: new ConstraintGuideline(EA.CONSTRAINT_GUIDELINE, framework)
        });
        initialized = true;
        return {
            application,
            framework,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (initialized) {
            return {
                application,
                framework,
                userSettings: application.userSettings
            };
        }
        return appBase.create();
    }
};

export default appBase;