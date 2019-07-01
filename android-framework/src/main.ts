import { AppFramework } from '../../src/base/@types/application';
import { UserSettingsAndroid } from './@types/application';

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

import DelegateFixed from './extensions/delegate/fixed';
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

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID;
let initialized = false;
let application: Application<View>;
let file: File<View>;
let userSettings: UserSettingsAndroid;

function autoClose() {
    if (application && application.userSettings.autoCloseOnWrite && !application.initializing && !application.closed) {
        application.finalize();
        return true;
    }
    return false;
}

const checkApplication = (main?: Application<View>): main is Application<View> => initialized && !!main && (main.closed || autoClose());

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
            Fixed: DelegateFixed,
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
        copyLayoutAllXml(directory: string) {
            if (checkApplication(application)) {
                file.layoutAllToXml(application.layouts, directory);
            }
        },
        copyResourceAllXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceAllToXml(directory);
            }
        },
        copyResourceStringXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceStringToXml(directory);
            }
        },
        copyResourceArrayXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceStringArrayToXml(directory);
            }
        },
        copyResourceFontXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceFontToXml(directory);
            }
        },
        copyResourceColorXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceColorToXml(directory);
            }
        },
        copyResourceStyleXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceStyleToXml(directory);
            }
        },
        copyResourceDimenXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceDimenToXml(directory);
            }
        },
        copyResourceDrawableXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceDrawableToXml(directory);
            }
        },
        copyResourceDrawableImageXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceDrawableImageToXml(directory);
            }
        },
        copyResourceAnimXml(directory: string) {
            if (checkApplication(application)) {
                file.resourceAnimToXml(directory);
            }
        },
        saveLayoutAllXml(filename?: string) {
            if (checkApplication(application)) {
                file.layoutAllToXml(application.layouts, undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceAllXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceAllToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceStringXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceStringToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceArrayXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceStringArrayToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceFontXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceFontToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceColorXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceColorToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceStyleXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceStyleToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceDimenXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceDimenToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceDrawableXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceDrawableToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceDrawableImageXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceDrawableImageToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        saveResourceAnimXml(filename?: string) {
            if (checkApplication(application)) {
                file.resourceAnimToXml(undefined, filename || userSettings.outputArchiveName);
            }
        },
        writeLayoutAllXml() {
            if (checkApplication(application)) {
                return file.layoutAllToXml(application.layouts);
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
        const EN = squared.base.lib.constant.EXT_NAME;
        const EA = constant.EXT_ANDROID;
        application = new Application<View>(framework, View, Controller, Resource, ExtensionManager);
        file = new File();
        application.resourceHandler.setFileHandler(file);
        userSettings = { ...SETTINGS };
        Object.assign(application.builtInExtensions, {
            [EN.EXTERNAL]: new External(EN.EXTERNAL, framework),
            [EN.SUBSTITUTE]: new Substitute(EN.SUBSTITUTE, framework),
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
            [EA.CONSTRAINT_GUIDELINE]: new ConstraintGuideline(EA.CONSTRAINT_GUIDELINE, framework),
            [EA.DELEGATE_FIXED]: new DelegateFixed(EA.DELEGATE_FIXED, framework),
            [EA.DELEGATE_MAXWIDTHHEIGHT]: new DelegateMaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
            [EA.DELEGATE_NEGATIVEVIEWPORT]: new DelegateNegativeViewport(EA.DELEGATE_NEGATIVEVIEWPORT, framework),
            [EA.DELEGATE_NEGATIVEX]: new DelegateNegativeX(EA.DELEGATE_NEGATIVEX, framework),
            [EA.DELEGATE_PERCENT]: new DelegatePercent(EA.DELEGATE_PERCENT, framework),
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