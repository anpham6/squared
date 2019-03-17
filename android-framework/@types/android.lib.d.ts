import { StyleAttribute } from '../src/@types/application';
import { ViewAttribute } from '../src/@types/node';

import * as $const from '../src/lib/constant';
import * as $custom from '../src/lib/customization';
import * as $enum from '../src/lib/enumeration';

declare global {
    namespace android.lib {
        namespace enumeration {
            export import BUILD_ANDROID = $enum.BUILD_ANDROID;
            export import DENSITY_ANDROID = $enum.DENSITY_ANDROID;
            export import CONTAINER_NODE = $enum.CONTAINER_NODE;
        }

        namespace constant {
            export import EXT_ANDROID = $const.EXT_ANDROID;
            export import CONTAINER_ANDROID = $const.CONTAINER_ANDROID;
            export import SUPPORT_ANDROID = $const.SUPPORT_ANDROID;
            export import ELEMENT_ANDROID = $const.ELEMENT_ANDROID;
            export import BOX_ANDROID = $const.BOX_ANDROID;
            export import AXIS_ANDROID = $const.AXIS_ANDROID;
            export import LAYOUT_ANDROID = $const.LAYOUT_ANDROID;
            export import XMLNS_ANDROID = $const.XMLNS_ANDROID;
            export import PREFIX_ANDROID = $const.PREFIX_ANDROID;
            export import RESERVED_JAVA = $const.RESERVED_JAVA;
        }

        namespace customizations {
            export import API_ANDROID = $custom.API_ANDROID;
            export import DEPRECATED_ANDROID = $custom.DEPRECATED_ANDROID;
            function getValue(api: number, tagName: string, obj: string, attr: string): string;
        }

        namespace util {
            function stripId(value: string): string;
            function createViewAttribute(options?: ExternalData): ViewAttribute;
            function createStyleAttribute(options?: ExternalData): Required<StyleAttribute>;
            function convertLength(value: string, dpi?: number, font?: boolean): string;
            function replaceLength(value: string, dpi?: number, format?: string, font?: boolean): string;
            function replaceRTL(value: string, rtl: boolean, api: number): string;
            function getXmlNs(...values: string[]): string;
        }
    }
}

export = android.lib;