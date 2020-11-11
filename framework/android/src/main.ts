import APP_FRAMEWORK = squared.base.lib.constant.APP_FRAMEWORK;
import EXT_NAME = squared.base.lib.internal.EXT_NAME;
import EXT_ANDROID = android.internal.EXT_ANDROID;

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

type FileCopyingOptions = squared.base.FileCopyingOptions;
type FileArchivingOptions = squared.base.FileArchivingOptions;

let application: Null<Application<View>> = null;
let file: Null<File<View>> = null;

const checkApplication = () => application ? application.closed || !application.initializing && application.finalize() : false;
const checkFileName = (value: Undef<string>) => value || application!.userSettings.outputArchiveName;

const appBase: android.AppFramework<View> = {
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
        copyLayoutAllXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.layoutAllToXml(application!.layouts, { ...options, directory });
            }
        },
        copyResourceAllXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceAllToXml({ ...options, directory });
            }
        },
        copyResourceStringXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceStringToXml({ ...options, directory });
            }
        },
        copyResourceArrayXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceStringArrayToXml({ ...options, directory });
            }
        },
        copyResourceFontXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceFontToXml({ ...options, directory });
            }
        },
        copyResourceColorXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceColorToXml({ ...options, directory });
            }
        },
        copyResourceStyleXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceStyleToXml({ ...options, directory });
            }
        },
        copyResourceDimenXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceDimenToXml({ ...options, directory });
            }
        },
        copyResourceDrawableXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceDrawableToXml({ ...options, directory });
            }
        },
        copyResourceAnimXml(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceAnimToXml({ ...options, directory });
            }
        },
        copyResourceDrawableImage(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceDrawableImageToString({ ...options, directory });
            }
        },
        copyResourceRawVideo(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceRawVideoToString({ ...options, directory });
            }
        },
        copyResourceRawAudio(directory: string, options?: FileCopyingOptions) {
            if (checkApplication()) {
                file!.resourceRawAudioToString({ ...options, directory });
            }
        },
        saveLayoutAllXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.layoutAllToXml(application!.layouts, { ...options, filename: checkFileName(filename) + '-layouts' });
            }
        },
        saveResourceAllXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceAllToXml({ ...options, filename: checkFileName(filename) + '-resources' });
            }
        },
        saveResourceStringXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceStringToXml({ ...options, filename: checkFileName(filename) + '-string' });
            }
        },
        saveResourceArrayXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceStringArrayToXml({ ...options, filename: checkFileName(filename) + '-array' });
            }
        },
        saveResourceFontXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceFontToXml({ ...options, filename: checkFileName(filename) + '-font' });
            }
        },
        saveResourceColorXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceColorToXml({ ...options, filename: checkFileName(filename) + '-color' });
            }
        },
        saveResourceStyleXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceStyleToXml({ ...options, filename: checkFileName(filename) + '-style' });
            }
        },
        saveResourceDimenXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceDimenToXml({ ...options, filename: checkFileName(filename) + '-dimen' });
            }
        },
        saveResourceDrawableXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceDrawableToXml({ ...options, filename: checkFileName(filename) + '-drawable' });
            }
        },
        saveResourceAnimXml(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceAnimToXml({ ...options, filename: checkFileName(filename) + '-anim' });
            }
        },
        saveResourceDrawableImage(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceDrawableImageToString({ ...options, filename: checkFileName(filename) + '-drawable-image' });
            }
        },
        saveResourceRawVideo(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceRawVideoToString({ ...options, filename: checkFileName(filename) + '-raw-video' });
            }
        },
        saveResourceRawAudio(filename?: string, options?: FileArchivingOptions) {
            if (checkApplication()) {
                file!.resourceRawAudioToString({ ...options, filename: checkFileName(filename) + '-raw-audio' });
            }
        },
        writeLayoutAllXml(options?: FileActionOptions) {
            return checkApplication() ? file!.layoutAllToXml(application!.layouts, options) : {};
        },
        writeResourceAllXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceAllToXml(options) : {};
        },
        writeResourceStringXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceStringToXml(options) : [];
        },
        writeResourceArrayXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceStringArrayToXml(options) : [];
        },
        writeResourceFontXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceFontToXml(options) : [];
        },
        writeResourceColorXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceColorToXml(options) : [];
        },
        writeResourceStyleXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceStyleToXml(options) : [];
        },
        writeResourceDimenXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceDimenToXml(options) : [];
        },
        writeResourceDrawableXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceDrawableToXml(options) : [];
        },
        writeResourceAnimXml(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceAnimToXml(options) : [];
        },
        writeResourceDrawableImage(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceDrawableImageToString(options) : [];
        },
        writeResourceRawVideo(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceRawVideoToString(options) : [];
        },
        writeResourceRawAudio(options?: FileActionOptions) {
            return checkApplication() ? file!.resourceRawAudioToString(options) : [];
        }
    },
    create() {
        application = new Application<View>(
            APP_FRAMEWORK.ANDROID,
            View,
            Controller,
            squared.base.ExtensionManager,
            Resource
        );
        file = new File();
        application.resourceHandler.fileHandler = file;
        application.builtInExtensions = new Map<string, squared.base.ExtensionUI<View>>([
            [EXT_NAME.ACCESSIBILITY, new Accessibility(EXT_NAME.ACCESSIBILITY, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_BACKGROUND, new DelegateBackground(EXT_ANDROID.DELEGATE_BACKGROUND, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_NEGATIVEX, new DelegateNegativeX(EXT_ANDROID.DELEGATE_NEGATIVEX, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_POSITIVEX, new DelegatePositiveX(EXT_ANDROID.DELEGATE_POSITIVEX, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, new DelegateMaxWidthHeight(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_PERCENT, new DelegatePercent(EXT_ANDROID.DELEGATE_PERCENT, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_SCROLLBAR, new DelegateScrollBar(EXT_ANDROID.DELEGATE_SCROLLBAR, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_RADIOGROUP, new DelegateRadioGroup(EXT_ANDROID.DELEGATE_RADIOGROUP, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.DELEGATE_MULTILINE, new DelegateMultiline(EXT_ANDROID.DELEGATE_MULTILINE, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.RELATIVE, new Relative(EXT_NAME.RELATIVE, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.CSS_GRID, new CssGrid(EXT_NAME.CSS_GRID, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.FLEXBOX, new Flexbox(EXT_NAME.FLEXBOX, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.TABLE, new Table(EXT_NAME.TABLE, APP_FRAMEWORK.ANDROID, { tagNames: ['TABLE'] })],
            [EXT_NAME.COLUMN, new Column(EXT_NAME.COLUMN, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.LIST, new List(EXT_NAME.LIST, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.GRID, new Grid(EXT_NAME.GRID, APP_FRAMEWORK.ANDROID, { tagNames: ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET'] })],
            [EXT_NAME.SPRITE, new Sprite(EXT_NAME.SPRITE, APP_FRAMEWORK.ANDROID)],
            [EXT_NAME.WHITESPACE, new WhiteSpace(EXT_NAME.WHITESPACE, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_SVG, new ResourceSvg(EXT_ANDROID.RESOURCE_SVG, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_BACKGROUND, new ResourceBackground(EXT_ANDROID.RESOURCE_BACKGROUND, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_STRINGS, new ResourceStrings(EXT_ANDROID.RESOURCE_STRINGS, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_FONTS, new ResourceFonts(EXT_ANDROID.RESOURCE_FONTS, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_DIMENS, new ResourceDimens(EXT_ANDROID.RESOURCE_DIMENS, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_STYLES, new ResourceStyles(EXT_ANDROID.RESOURCE_STYLES, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_INCLUDES, new ResourceIncludes(EXT_ANDROID.RESOURCE_INCLUDES, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.RESOURCE_DATA, new ResourceData(EXT_ANDROID.RESOURCE_DATA, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.EXTERNAL, new External(EXT_ANDROID.EXTERNAL, APP_FRAMEWORK.ANDROID)],
            [EXT_ANDROID.SUBSTITUTE, new Substitute(EXT_ANDROID.SUBSTITUTE, APP_FRAMEWORK.ANDROID)]
        ]);
        return {
            application,
            framework: APP_FRAMEWORK.ANDROID,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework: APP_FRAMEWORK.ANDROID,
                userSettings: application.userSettings
            };
        }
        return this.create();
    },
    setViewModel(data: PlainObject, sessionId?: string) {
        if (application) {
            application.setViewModel(data, sessionId);
        }
    },
    customize(build: number, widget: string, options: ObjectMap<StringMap>) {
        const api = customization.API_VERSION[build];
        if (api) {
            const data = api.assign[widget];
            return data ? Object.assign(data, options) : api.assign[widget] = options;
        }
    },
    addXmlNs(name: string, uri: string) {
        constant.XML_NAMESPACE[name] = uri;
    }
};

export default appBase;