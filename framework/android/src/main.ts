import EXT_NAME = squared.base.constant.EXT_NAME;
import EXT_ANDROID = android.base.constant.EXT_ANDROID;

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
import * as util from './lib/util';
import * as customization from './lib/customization';

import SETTINGS from './settings';

const framework = squared.base.lib.constant.APP_FRAMEWORK.ANDROID;
let application: Null<Application<View>> = null;
let file: Null<File<View>> = null;

const checkApplication = () => application ? application.closed || !application.initializing && application.finalize() : false;
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
        application = new Application<View>(
            framework,
            View,
            Controller,
            Resource,
            squared.base.ExtensionManager
        );
        file = new File();
        application.resourceHandler.fileHandler = file;
        application.builtInExtensions = new Map<string, squared.base.ExtensionUI<View>>([
            [EXT_NAME.ACCESSIBILITY, new Accessibility(EXT_NAME.ACCESSIBILITY, framework)],
            [EXT_ANDROID.DELEGATE_BACKGROUND, new DelegateBackground(EXT_ANDROID.DELEGATE_BACKGROUND, framework)],
            [EXT_ANDROID.DELEGATE_NEGATIVEX, new DelegateNegativeX(EXT_ANDROID.DELEGATE_NEGATIVEX, framework)],
            [EXT_ANDROID.DELEGATE_POSITIVEX, new DelegatePositiveX(EXT_ANDROID.DELEGATE_POSITIVEX, framework)],
            [EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, new DelegateMaxWidthHeight(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, framework)],
            [EXT_ANDROID.DELEGATE_PERCENT, new DelegatePercent(EXT_ANDROID.DELEGATE_PERCENT, framework)],
            [EXT_ANDROID.DELEGATE_SCROLLBAR, new DelegateScrollBar(EXT_ANDROID.DELEGATE_SCROLLBAR, framework)],
            [EXT_ANDROID.DELEGATE_RADIOGROUP, new DelegateRadioGroup(EXT_ANDROID.DELEGATE_RADIOGROUP, framework)],
            [EXT_ANDROID.DELEGATE_MULTILINE, new DelegateMultiline(EXT_ANDROID.DELEGATE_MULTILINE, framework)],
            [EXT_NAME.RELATIVE, new Relative(EXT_NAME.RELATIVE, framework)],
            [EXT_NAME.CSS_GRID, new CssGrid(EXT_NAME.CSS_GRID, framework)],
            [EXT_NAME.FLEXBOX, new Flexbox(EXT_NAME.FLEXBOX, framework)],
            [EXT_NAME.TABLE, new Table(EXT_NAME.TABLE, framework, { tagNames: ['TABLE'] })],
            [EXT_NAME.COLUMN, new Column(EXT_NAME.COLUMN, framework)],
            [EXT_NAME.LIST, new List(EXT_NAME.LIST, framework)],
            [EXT_NAME.GRID, new Grid(EXT_NAME.GRID, framework, { tagNames: ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET'] })],
            [EXT_NAME.SPRITE, new Sprite(EXT_NAME.SPRITE, framework)],
            [EXT_NAME.WHITESPACE, new WhiteSpace(EXT_NAME.WHITESPACE, framework)],
            [EXT_ANDROID.RESOURCE_SVG, new ResourceSvg(EXT_ANDROID.RESOURCE_SVG, framework)],
            [EXT_ANDROID.RESOURCE_BACKGROUND, new ResourceBackground(EXT_ANDROID.RESOURCE_BACKGROUND, framework)],
            [EXT_ANDROID.RESOURCE_STRINGS, new ResourceStrings(EXT_ANDROID.RESOURCE_STRINGS, framework)],
            [EXT_ANDROID.RESOURCE_FONTS, new ResourceFonts(EXT_ANDROID.RESOURCE_FONTS, framework)],
            [EXT_ANDROID.RESOURCE_DIMENS, new ResourceDimens(EXT_ANDROID.RESOURCE_DIMENS, framework)],
            [EXT_ANDROID.RESOURCE_STYLES, new ResourceStyles(EXT_ANDROID.RESOURCE_STYLES, framework)],
            [EXT_ANDROID.RESOURCE_INCLUDES, new ResourceIncludes(EXT_ANDROID.RESOURCE_INCLUDES, framework)],
            [EXT_ANDROID.RESOURCE_DATA, new ResourceData(EXT_ANDROID.RESOURCE_DATA, framework)],
            [EXT_ANDROID.EXTERNAL, new External(EXT_ANDROID.EXTERNAL, framework)],
            [EXT_ANDROID.SUBSTITUTE, new Substitute(EXT_ANDROID.SUBSTITUTE, framework)]
        ]);
        return {
            application,
            framework,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework,
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