import * as $const from '../base/lib/constant';
import * as $enum from '../base/lib/enumeration';

declare global {
    namespace squared.base.lib {
        namespace constant {
            export import STRING_BASE = $const.STRING_BASE;
            export import CSS_SPACING = $const.CSS_SPACING;
            export import EXT_NAME = $const.EXT_NAME;
        }

        namespace enumeration {
            export import APP_FRAMEWORK = $enum.APP_FRAMEWORK;
            export import APP_SECTION = $enum.APP_SECTION;
            export import BOX_STANDARD = $enum.BOX_STANDARD;
            export import CSS_UNIT = $enum.CSS_UNIT;
            export import NODE_ALIGNMENT = $enum.NODE_ALIGNMENT;
            export import NODE_TEMPLATE = $enum.NODE_TEMPLATE;
            export import NODE_PROCEDURE = $enum.NODE_PROCEDURE;
            export import NODE_RESOURCE = $enum.NODE_RESOURCE;
        }
    }
}

export = squared.base.lib;