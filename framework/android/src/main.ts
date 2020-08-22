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
import WhiteSpace from './extensions/whitespace';

import DelegateBackground from './extensions/delegate/background';
import DelegateMaxWidthHeight from './extensions/delegate/max-width-height';
import DelegateMultiline from './extensions/delegate/multiline';
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

let application: Null<Application<View>> = null;
let file: Null<File<View>> = null;

const autoClose = () => application && !application.initializing && !application.closed && application.userSettings.autoCloseOnWrite ? application.finalize() : false;
const checkApplication = () => application ? application.closed || autoClose() : false;
const createAssetsOptions = (options: Undef<FileUniversalOptions>, directory?: string, filename?: string): FileUniversalOptions => ({ ...options, directory, filename });
const checkFileName = (value: Undef<string>) => value || application!.userSettings.outputArchiveName;

const appBase: android.AndroidFramework<View> = {
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
        WhiteSpace,
        delegate: {
            Background: DelegateBackground,
            MaxWidthHeight: DelegateMaxWidthHeight,
            Multiline: DelegateMultiline,
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
    lib: {
        constant,
        customization,
        enumeration,
        util
    },
    system: {
        customize(build: number, widget: string, options: ObjectMap<StringMap>) {
            const api = customization.API_ANDROID[build];
            if (api) {
                const data = api.assign[widget];
                return data ? Object.assign(data, options) : api.assign[widget] = options;
            }
        },
        addXmlNs(name: string, uri: string) {
            constant.XMLNS_ANDROID[name] = uri;
        },
        copyLayoutAllXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.layoutAllToXml(application!.layouts, createAssetsOptions(options, directory));
            }
        },
        copyResourceAllXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceAllToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceStringXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceStringToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceArrayXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceStringArrayToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceFontXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceFontToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceColorXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceColorToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceStyleXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceStyleToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceDimenXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceDimenToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceDrawableXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceDrawableToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceAnimXml(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceAnimToXml(createAssetsOptions(options, directory));
            }
        },
        copyResourceDrawableImage(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceDrawableImageToString(createAssetsOptions(options, directory));
            }
        },
        copyResourceRawVideo(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceRawVideoToString(createAssetsOptions(options, directory));
            }
        },
        copyResourceRawAudio(directory: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceRawAudioToString(createAssetsOptions(options, directory));
            }
        },
        saveLayoutAllXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.layoutAllToXml(application!.layouts, createAssetsOptions(options, undefined, checkFileName(filename) + '-layouts'));
            }
        },
        saveResourceAllXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceAllToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-resources'));
            }
        },
        saveResourceStringXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceStringToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-string'));
            }
        },
        saveResourceArrayXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceStringArrayToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-array'));
            }
        },
        saveResourceFontXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceFontToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-font'));
            }
        },
        saveResourceColorXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceColorToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-color'));
            }
        },
        saveResourceStyleXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceStyleToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-style'));
            }
        },
        saveResourceDimenXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceDimenToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-dimen'));
            }
        },
        saveResourceDrawableXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceDrawableToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-drawable'));
            }
        },
        saveResourceAnimXml(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceAnimToXml(createAssetsOptions(options, undefined, checkFileName(filename) + '-anim'));
            }
        },
        saveResourceDrawableImage(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceDrawableImageToString(createAssetsOptions(options, undefined, checkFileName(filename) + '-drawable-image'));
            }
        },
        saveResourceRawVideo(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceRawVideoToString(createAssetsOptions(options, undefined, checkFileName(filename) + '-raw-video'));
            }
        },
        saveResourceRawAudio(filename?: string, options?: FileUniversalOptions) {
            if (checkApplication()) {
                file!.resourceRawAudioToString(createAssetsOptions(options, undefined, checkFileName(filename) + '-raw-audio'));
            }
        },
        writeLayoutAllXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.layoutAllToXml(application!.layouts, options) : {};
        },
        writeResourceAllXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceAllToXml(options) : {};
        },
        writeResourceStringXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceStringToXml(options) : [];
        },
        writeResourceArrayXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceStringArrayToXml(options) : [];
        },
        writeResourceFontXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceFontToXml(options) : [];
        },
        writeResourceColorXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceColorToXml(options) : [];
        },
        writeResourceStyleXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceStyleToXml(options) : [];
        },
        writeResourceDimenXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceDimenToXml(options) : [];
        },
        writeResourceDrawableXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceDrawableToXml(options) : [];
        },
        writeResourceAnimXml(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceAnimToXml(options) : [];
        },
        writeResourceDrawableImage(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceDrawableImageToString(options) : [];
        },
        writeResourceRawVideo(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceRawVideoToString(options) : [];
        },
        writeResourceRawAudio(options?: FileUniversalOptions) {
            return checkApplication() ? file!.resourceRawAudioToString(options) : [];
        }
    },
    create() {
        const EN = squared.base.lib.constant.EXT_NAME as StringMapChecked;
        const EA = constant.EXT_ANDROID;
        application = new Application<View>(squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, View, Controller, Resource, squared.base.ExtensionManager);
        file = new File();
        application.resourceHandler.fileHandler = file;
        application.builtInExtensions = new Map<string, squared.base.ExtensionUI<View>>([
            [EN.ACCESSIBILITY, new Accessibility(EN.ACCESSIBILITY, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_BACKGROUND, new DelegateBackground(EA.DELEGATE_BACKGROUND, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_NEGATIVEX, new DelegateNegativeX(EA.DELEGATE_NEGATIVEX, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_POSITIVEX, new DelegatePositiveX(EA.DELEGATE_POSITIVEX, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_MAXWIDTHHEIGHT, new DelegateMaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_PERCENT, new DelegatePercent(EA.DELEGATE_PERCENT, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_SCROLLBAR, new DelegateScrollBar(EA.DELEGATE_SCROLLBAR, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_RADIOGROUP, new DelegateRadioGroup(EA.DELEGATE_RADIOGROUP, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.DELEGATE_MULTILINE, new DelegateMultiline(EA.DELEGATE_MULTILINE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.RELATIVE, new Relative(EN.RELATIVE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.CSS_GRID, new CssGrid(EN.CSS_GRID, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.FLEXBOX, new Flexbox(EN.FLEXBOX, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.TABLE, new Table(EN.TABLE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, { tagNames: ['TABLE'] })],
            [EN.COLUMN, new Column(EN.COLUMN, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.LIST, new List(EN.LIST, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.GRID, new Grid(EN.GRID, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID, { tagNames: ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET'] })],
            [EN.SPRITE, new Sprite(EN.SPRITE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EN.WHITESPACE, new WhiteSpace(EN.WHITESPACE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_SVG, new ResourceSvg(EA.RESOURCE_SVG, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_BACKGROUND, new ResourceBackground(EA.RESOURCE_BACKGROUND, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_STRINGS, new ResourceStrings(EA.RESOURCE_STRINGS, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_FONTS, new ResourceFonts(EA.RESOURCE_FONTS, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_DIMENS, new ResourceDimens(EA.RESOURCE_DIMENS, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_STYLES, new ResourceStyles(EA.RESOURCE_STYLES, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_INCLUDES, new ResourceIncludes(EA.RESOURCE_INCLUDES, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.RESOURCE_DATA, new ResourceData(EA.RESOURCE_DATA, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.EXTERNAL, new External(EA.EXTERNAL, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)],
            [EA.SUBSTITUTE, new Substitute(EA.SUBSTITUTE, squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID)]
        ]);
        return {
            application,
            framework: squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework: squared.base.lib.enumeration.APP_FRAMEWORK.ANDROID,
                userSettings: application.userSettings
            };
        }
        return appBase.create();
    },
    setViewModel(data: PlainObject, sessionId?: string) {
        if (application) {
            application.setViewModel(data, sessionId);
        }
    }
};

export default appBase;