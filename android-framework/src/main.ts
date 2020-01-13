import { AppFramework } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import File from './file';
import Resource from './resource';
import View from './view';

import Accessibility from './extensions/accessibility';
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
import DelegateFixed from './extensions/delegate/fixed';
import DelegateCssGrid from './extensions/delegate/cssgrid';
import DelegateMaxWidthHeight from './extensions/delegate/max-width-height';
import DelegateNegativeViewport from './extensions/delegate/negative-viewport';
import DelegateNegativeX from './extensions/delegate/negative-x';
import DelegatePercent from './extensions/delegate/percent';
import DelegateRadioGroup from './extensions/delegate/radiogroup';
import DelegateScrollBar from './extensions/delegate/scrollbar';

import ResourceBackground from './extensions/resource/background';
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

const $lib = squared.base.lib;

const framework = $lib.enumeration.APP_FRAMEWORK.ANDROID;
let initialized = false;
let application: Application<View>;
let file: File<View>;
let userSettings: UserSettingsAndroid;

function autoClose() {
    if (initialized && !application.initializing && !application.closed && application.userSettings.autoCloseOnWrite) {
        application.finalize();
        return true;
    }
    return false;
}

const checkApplication = (main: Application<View>): main is Application<View> => initialized && (main.closed || autoClose());

const lib = {
    constant,
    customization,
    enumeration,
    util
};

const appBase: AppFramework<View> = {
    base: {
        Controller,
        File,
        Resource,
        View
    },
    extensions: {
        Accessibility,
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
            Fixed: DelegateFixed,
            CssGrid: DelegateCssGrid,
            MaxWidthHeight: DelegateMaxWidthHeight,
            NegativeViewport: DelegateNegativeViewport,
            NegativeX: DelegateNegativeX,
            Percent: DelegatePercent,
            RadioGroup: DelegateRadioGroup,
            ScrollBar: DelegateScrollBar
        },
        resource: {
            Background: ResourceBackground,
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
        copyLayoutAllXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.layoutAllToXml({ assets: application.layouts, copyTo: directory, callback });
            }
        },
        copyResourceAllXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceAllToXml({ copyTo: directory, callback });
            }
        },
        copyResourceStringXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceStringToXml({ copyTo: directory, callback });
            }
        },
        copyResourceArrayXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceStringArrayToXml({ copyTo: directory, callback });
            }
        },
        copyResourceFontXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceFontToXml({ copyTo: directory, callback });
            }
        },
        copyResourceColorXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceColorToXml({ copyTo: directory, callback });
            }
        },
        copyResourceStyleXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceStyleToXml({ copyTo: directory, callback });
            }
        },
        copyResourceDimenXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceDimenToXml({ copyTo: directory, callback });
            }
        },
        copyResourceDrawableXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceDrawableToXml({ copyTo: directory, callback });
            }
        },
        copyResourceDrawableImageXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceDrawableImageToXml({ copyTo: directory, callback });
            }
        },
        copyResourceAnimXml(directory: string, callback?: CallbackResult) {
            if (checkApplication(application)) {
                file.resourceAnimToXml({ copyTo: directory, callback });
            }
        },
        saveLayoutAllXml(filename?: string) {
            if (checkApplication(application)) {
                file.layoutAllToXml({ assets: application.layouts, archiveTo: filename || userSettings.outputArchiveName + '-layouts' });
            }
        },
        saveResourceAllXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceAllToXml({ archiveTo: filename || userSettings.outputArchiveName + '-resources' });
            }
        },
        saveResourceStringXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceStringToXml({ archiveTo: filename || userSettings.outputArchiveName + '-string' });
            }
        },
        saveResourceArrayXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceStringArrayToXml({ archiveTo: filename || userSettings.outputArchiveName + '-array' });
            }
        },
        saveResourceFontXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceFontToXml({ archiveTo: filename || userSettings.outputArchiveName + '-font' });
            }
        },
        saveResourceColorXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceColorToXml({ archiveTo: filename || userSettings.outputArchiveName + '-color' });
            }
        },
        saveResourceStyleXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceStyleToXml({ archiveTo: filename || userSettings.outputArchiveName + '-style' });
            }
        },
        saveResourceDimenXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceDimenToXml({ archiveTo: filename || userSettings.outputArchiveName + '-dimen' });
            }
        },
        saveResourceDrawableXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceDrawableToXml({ archiveTo: filename || userSettings.outputArchiveName + '-drawable' });
            }
        },
        saveResourceDrawableImageXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceDrawableImageToXml({ archiveTo: filename || userSettings.outputArchiveName + '-drawable-image' });
            }
        },
        saveResourceAnimXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceAnimToXml({ archiveTo: filename || userSettings.outputArchiveName + '-anim' });
            }
        },
        writeLayoutAllXml() {
            if (checkApplication(application)) {
                return file.layoutAllToXml({ assets: application.layouts });
            }
            return {};
        },
        writeResourceAllXml() {
            if (checkApplication(application)) {
                return file.resourceAllToXml();
            }
            return {};
        },
        writeResourceStringXml() {
            if (checkApplication(application)) {
                return file.resourceStringToXml();
            }
            return [];
        },
        writeResourceArrayXml() {
            if (checkApplication(application)) {
                return file.resourceStringArrayToXml();
            }
            return [];
        },
        writeResourceFontXml() {
            if (checkApplication(application)) {
                return file.resourceFontToXml();
            }
            return [];
        },
        writeResourceColorXml() {
            if (checkApplication(application)) {
                return file.resourceColorToXml();
            }
            return [];
        },
        writeResourceStyleXml() {
            if (checkApplication(application)) {
                return file.resourceStyleToXml();
            }
            return [];
        },
        writeResourceDimenXml() {
            if (checkApplication(application)) {
                return file.resourceDimenToXml();
            }
            return [];
        },
        writeResourceDrawableXml() {
            if (checkApplication(application)) {
                return file.resourceDrawableToXml();
            }
            return [];
        },
        writeResourceDrawableImageXml() {
            if (checkApplication(application)) {
                return file.resourceDrawableImageToXml();
            }
            return [];
        },
        writeResourceAnimXml() {
            if (checkApplication(application)) {
                return file.resourceAnimToXml();
            }
            return [];
        }
    },
    create() {
        const EN = $lib.constant.EXT_NAME;
        const EA = constant.EXT_ANDROID;
        application = new Application<View>(framework, View, Controller, Resource, ExtensionManager);
        file = new File();
        application.resourceHandler.setFileHandler(file);
        userSettings = { ...SETTINGS };
        Object.assign(application.builtInExtensions, {
            [EN.SPRITE]: new Sprite(EN.SPRITE, framework),
            [EN.CSS_GRID]: new CssGrid(EN.CSS_GRID, framework),
            [EN.FLEXBOX]: new Flexbox(EN.FLEXBOX, framework),
            [EN.TABLE]: new Table(EN.TABLE, framework, undefined, ['TABLE']),
            [EN.LIST]: new List(EN.LIST, framework, undefined, ['DIV', 'UL', 'OL', 'DL']),
            [EN.GRID]: new Grid(EN.GRID, framework, undefined, ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET']),
            [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
            [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
            [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
            [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
            [EA.EXTERNAL]: new External(EA.EXTERNAL, framework),
            [EA.SUBSTITUTE]: new Substitute(EA.SUBSTITUTE, framework),
            [EA.CONSTRAINT_GUIDELINE]: new ConstraintGuideline(EA.CONSTRAINT_GUIDELINE, framework),
            [EA.DELEGATE_BACKGROUND]: new DelegateBackground(EA.DELEGATE_BACKGROUND, framework),
            [EA.DELEGATE_FIXED]: new DelegateFixed(EA.DELEGATE_FIXED, framework),
            [EA.DELEGATE_MAXWIDTHHEIGHT]: new DelegateMaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
            [EA.DELEGATE_NEGATIVEVIEWPORT]: new DelegateNegativeViewport(EA.DELEGATE_NEGATIVEVIEWPORT, framework),
            [EA.DELEGATE_NEGATIVEX]: new DelegateNegativeX(EA.DELEGATE_NEGATIVEX, framework),
            [EA.DELEGATE_PERCENT]: new DelegatePercent(EA.DELEGATE_PERCENT, framework),
            [EA.DELEGATE_CSS_GRID]: new DelegateCssGrid(EA.DELEGATE_CSS_GRID, framework),
            [EA.DELEGATE_RADIOGROUP]: new DelegateRadioGroup(EA.DELEGATE_RADIOGROUP, framework),
            [EA.DELEGATE_SCROLLBAR]: new DelegateScrollBar(EA.DELEGATE_SCROLLBAR, framework),
            [EA.RESOURCE_INCLUDES]: new ResourceIncludes(EA.RESOURCE_INCLUDES, framework),
            [EA.RESOURCE_BACKGROUND]: new ResourceBackground(EA.RESOURCE_BACKGROUND, framework),
            [EA.RESOURCE_SVG]: new ResourceSvg(EA.RESOURCE_SVG, framework),
            [EA.RESOURCE_STRINGS]: new ResourceStrings(EA.RESOURCE_STRINGS, framework),
            [EA.RESOURCE_FONTS]: new ResourceFonts(EA.RESOURCE_FONTS, framework),
            [EA.RESOURCE_DIMENS]: new ResourceDimens(EA.RESOURCE_DIMENS, framework),
            [EA.RESOURCE_STYLES]: new ResourceStyles(EA.RESOURCE_STYLES, framework)
        });
        initialized = true;
        return {
            application,
            framework,
            userSettings
        };
    },
    cached() {
        if (initialized) {
            return {
                application,
                framework,
                userSettings
            };
        }
        return appBase.create();
    }
};

export default appBase;