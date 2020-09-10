import EXT_NAME = squared.base.EXT_NAME;
import EXT_ANDROID = android.base.EXT_ANDROID;

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

const framework = squared.base.lib.constant.APP_FRAMEWORK.ANDROID;
let application: Null<Application<View>> = null;
let file: Null<File<View>> = null;

const checkApplication = () => application ? application.closed || !application.initializing && application.finalize() : false;
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
            framework,
            View,
            Controller,
            squared.base.ExtensionManager,
            Resource
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