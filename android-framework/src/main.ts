import { AppFramework } from '../../src/base/types/application';
import { UserSettingsAndroid } from './types/application';

import { EXT_ANDROID, XMLNS_ANDROID } from './lib/constant';
import { API_ANDROID } from './customizations';
import SETTINGS from './settings';

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

type T = View;
type Application = squared.base.Application<T>;

function autoClose() {
    if (application && application.userSettings.autoCloseOnWrite && !application.initialized && !application.closed) {
        application.finalize();
        return true;
    }
    return false;
}

function checkApplication(main?: Application): main is Application {
    return initialized && !!main && (main.closed || autoClose());
}

let initialized = false;

let application: Application;
let fileHandler: File<T>;
let userSettings: UserSettingsAndroid;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID;

const lib = {
    constant,
    enumeration,
    util
};

const appBase: AppFramework<T> = {
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
        Table,
        VerticalAlign,
        WhiteSpace,
        constraint: {
            Guideline: ConstraintGuideline
        },
        delegate: {
            Fixed: DelegateFixed,
            MaxWidthHeight: DelegateMaxWidthHeight,
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
            if (API_ANDROID[build]) {
                const customizations = API_ANDROID[build].customizations;
                if (customizations[widget] === undefined) {
                    customizations[widget] = {};
                }
                Object.assign(customizations[widget], options);
            }
        },
        addXmlNs(name: string, uri: string) {
            XMLNS_ANDROID[name] = uri;
        },
        writeLayoutAllXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.layoutAllToXml(application.sessionData, saveToDisk);
            }
            return {};
        },
        writeResourceAllXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceAllToXml(saveToDisk);
            }
            return {};
        },
        writeResourceStringXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceStringToXml(saveToDisk);
            }
            return [];
        },
        writeResourceArrayXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceStringArrayToXml(saveToDisk);
            }
            return [];
        },
        writeResourceFontXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceFontToXml(saveToDisk);
            }
            return [];
        },
        writeResourceColorXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceColorToXml(saveToDisk);
            }
            return [];
        },
        writeResourceStyleXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceStyleToXml(saveToDisk);
            }
            return [];
        },
        writeResourceDimenXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceDimenToXml(saveToDisk);
            }
            return [];
        },
        writeResourceDrawableXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceDrawableToXml(saveToDisk);
            }
            return [];
        },
        writeResourceDrawableImageXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceDrawableImageToXml(saveToDisk);
            }
            return [];
        },
        writeResourceAnimatorXml(saveToDisk = false) {
            if (fileHandler && checkApplication(application)) {
                return fileHandler.resourceAnimatorToXml(saveToDisk);
            }
            return [];
        }
    },
    create() {
        const EN = squared.base.lib.constant.EXT_NAME;
        const EA = EXT_ANDROID;
        application = new squared.base.Application(framework, Controller, Resource, ExtensionManager, View);
        fileHandler = new File(application.resourceHandler);
        userSettings = Object.assign({}, SETTINGS);
        Object.assign(application.builtInExtensions, {
            [EN.EXTERNAL]: new External(EN.EXTERNAL, framework),
            [EN.SUBSTITUTE]: new Substitute(EN.SUBSTITUTE, framework),
            [EN.SPRITE]: new Sprite(EN.SPRITE, framework),
            [EN.CSS_GRID]: new CssGrid(EN.CSS_GRID, framework),
            [EN.FLEXBOX]: new Flexbox(EN.FLEXBOX, framework),
            [EN.TABLE]: new Table(EN.TABLE, framework, ['TABLE']),
            [EN.LIST]: new List(EN.LIST, framework, ['UL', 'OL', 'DL', 'DIV']),
            [EN.GRID]: new Grid(EN.GRID, framework, ['FORM', 'UL', 'OL', 'DL', 'DIV', 'TABLE', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET', 'SPAN']),
            [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
            [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
            [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
            [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
            [EA.CONSTRAINT_GUIDELINE]: new ConstraintGuideline(EA.CONSTRAINT_GUIDELINE, framework),
            [EA.DELEGATE_FIXED]: new DelegateFixed(EA.DELEGATE_FIXED, framework),
            [EA.DELEGATE_MAXWIDTHHEIGHT]: new DelegateMaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
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