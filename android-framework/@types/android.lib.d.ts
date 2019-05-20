import { StyleAttribute } from '../src/@types/application';
import { ViewAttribute } from '../src/@types/node';

import * as $const from '../src/lib/constant';
import * as $custom from '../src/lib/customization';
import * as $enum from '../src/lib/enumeration';

type View = android.base.View;

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
            export import STRING_ANDROID = $const.STRING_ANDROID;
            export import LAYOUT_ANDROID = $const.LAYOUT_ANDROID;
            export import XMLNS_ANDROID = $const.XMLNS_ANDROID;
            export import RESERVED_JAVA = $const.RESERVED_JAVA;
        }

        namespace customizations {
            export import API_ANDROID = $custom.API_ANDROID;
            export import DEPRECATED_ANDROID = $custom.DEPRECATED_ANDROID;
            function getValue(api: number, tagName: string, obj: string, attr: string): string;
        }

        namespace util {
            function getDocumentId(value: string): string;
            function getHorizontalBias(node: View): number;
            function getVerticalBias(node: View): number;
            function createViewAttribute(options?: ExternalData, android?: ExternalData, app?: ExternalData): ViewAttribute;
            function createStyleAttribute(options?: ExternalData): Required<StyleAttribute>;
            function localizeString(value: string, rtl: boolean, api: number): string;
            function getXmlNs(value: string): string;
            function getRootNs(value: string): string;
        }
    }
}

export = android.lib;