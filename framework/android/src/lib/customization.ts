import type View from '../view';

import { STRING_ANDROID } from './constant';

import BUILD_ANDROID = android.lib.enumeration.BUILD_ANDROID;

function substitute(result: PlainObject, attr: string, api?: number, minApi = 0, value?: string) {
    if (!api || api >= minApi) {
        result.attr = attr;
        if (value) {
            result.value = value;
        }
        return true;
    }
    return false;
}

export const API_ANDROID: Customizations<View> = {
    [BUILD_ANDROID.R]: {
        android: {},
        assign: {}
    },
    [BUILD_ANDROID.Q]: {
        android: {
            allowNativeHeapPointerTagging: false,
            animatedImageDrawable: false,
            canTakeScreenshot: false,
            crossProfile: false,
            forceQueryable: false,
            gwpAsanMode: false,
            htmlDescription: false,
            importantForContentCapture: false,
            mimeGroup: false,
            preferMinimalPostProcessing: false,
            preserveLegacyExternalStorage: false,
            resourcesMap: false,
            supportsInlineSuggestions: false
        },
        assign: {}
    },
    [BUILD_ANDROID.PIE]: {
        android: {
            allowAudioPlaybackCapture: false,
            enforceNavigationBarContrast: false,
            enforceStatusBarContrast: false,
            forceDarkAllowed: false,
            forceUriPermissions: false,
            foregroundServiceType: false,
            hasFragileUserData: false,
            identifier: false,
            inheritShowWhenLocked: false,
            interactiveUiTimeout: false,
            isLightTheme: false,
            isSplitRequired: false,
            minAspectRatio: false,
            nonInteractiveUiTimeout: false,
            opticalInsetBottom: false,
            opticalInsetLeft: false,
            opticalInsetRight: false,
            opticalInsetTop: false,
            packageType: false,
            requestLegacyExternalStorage: false,
            secureElementName: false,
            selectionDividerHeight: false,
            settingsSliceUri: false,
            shell: false,
            supportsMultipleDisplays: false,
            textLocale: false,
            useAppZygote: false,
            useEmbeddedDex: false,
            zygotePreloadName: false
        },
        assign: {}
    },
    [BUILD_ANDROID.OREO_1]: {
        android: {
            accessibilityHeading: false,
            accessibilityPaneTitle: false,
            appComponentFactory: false,
            buttonCornerRadius: false,
            cantSaveState: false,
            dialogCornerRadius: false,
            fallbackLineSpacing: false,
            firstBaselineToTopHeight: false,
            fontVariationSettings: false,
            lastBaselineToBottomHeight: false,
            lineHeight: false,
            maxLongVersionCode: false,
            outlineAmbientShadowColor: false,
            outlineSpotShadowColor: false,
            screenReaderFocusable: false,
            textFontWeight: false,
            ttcIndex: false,
            versionCodeMajor: false,
            versionMajor: false,
            widgetFeatures: false
        },
        assign: {}
    },
    [BUILD_ANDROID.OREO]: {
        android: {
            classLoader: false,
            navigationBarDividerColor: false,
            showWhenLocked: false,
            turnScreenOn: false,
            windowLayoutInDisplayCutoutMode: false,
            windowLightNavigationBar: false
        },
        assign: {}
    },
    [BUILD_ANDROID.NOUGAT_1]: {
        android: {
            alphabeticModifiers: false,
            appCategory: false,
            autoSizeMaxTextSize: false,
            autoSizeMinTextSize: false,
            autoSizePresetSizes: false,
            autoSizeStepGranularity: false,
            autoSizeTextType: false,
            autofillHints: false,
            autofilledHighlight: false,
            canRequestFingerprintGestures: false,
            certDigest: false,
            colorError: false,
            colorMode: false,
            defaultFocusHighlightEnabled: false,
            focusedByDefault: false,
            font: false,
            fontProviderAuthority: false,
            fontProviderCerts: false,
            fontProviderPackage: false,
            fontProviderQuery: false,
            fontStyle: false,
            fontWeight: false,
            iconSpaceReserved: false,
            iconTint: false,
            iconTintMode: false,
            importantForAutofill: false,
            isFeatureSplit: false,
            isStatic: false,
            isolatedSplits: false,
            justificationMode: false,
            keyboardNavigationCluster: false,
            layout_marginHorizontal: false,
            layout_marginVertical: false,
            maxAspectRatio: false,
            min: false,
            nextClusterForward: false,
            numericModifiers: false,
            paddingHorizontal: false,
            paddingVertical: false,
            persistentWhenFeatureAvailable: false,
            primaryContentAlpha: false,
            recreateOnConfigChanges: false,
            recycleEnabled: false,
            requiredFeature: false,
            requiredNotFeature: false,
            rotationAnimation: false,
            secondaryContentAlpha: false,
            singleLineTitle: false,
            splitName: false,
            targetProcesses: false,
            targetSandboxVersion: false,
            tooltipText: false,
            visibleToInstantApps: false,
            windowSplashscreenContent: false
        },
        assign: {}
    },
    [BUILD_ANDROID.NOUGAT]: {
        android: {
            colorSecondary: false,
            contextDescription: false,
            contextUri: false,
            roundIcon: false,
            shortcutDisabledMessage: false,
            shortcutId: false,
            shortcutLongLabel: false,
            shortcutShortLabel: false,
            showMetadataInPreview: false
        },
        assign: {}
    },
    [BUILD_ANDROID.MARSHMALLOW]: {
        android: {
            backupInForeground: false,
            bitmap: false,
            buttonGravity: false,
            canControlMagnification: false,
            canPerformGestures: false,
            canRecord: false,
            collapseIcon: false,
            contentInsetEndWithActions: false,
            contentInsetStartWithNavigation: false,
            contextPopupMenuStyle: false,
            countDown: false,
            defaultHeight: false,
            defaultToDeviceProtectedStorage: false,
            defaultWidth: false,
            directBootAware: false,
            enableVrMode: false,
            endX: false,
            endY: false,
            externalService: false,
            fillType: false,
            forceHasOverlappingRendering: false,
            hotSpotX: false,
            hotSpotY: false,
            languageTag: false,
            level: false,
            listMenuViewStyle: false,
            maxButtonHeight: false,
            networkSecurityConfig: false,
            numberPickerStyle: false,
            offset: false,
            pointerIcon: false,
            popupEnterTransition: false,
            popupExitTransition: false,
            preferenceFragmentStyle: false,
            resizeableActivity: false,
            startX: false,
            startY: false,
            subMenuArrow: false,
            supportsLocalInteraction: false,
            supportsPictureInPicture: false,
            textAppearancePopupMenuHeader: false,
            tickMark: false,
            tickMarkTint: false,
            tickMarkTintMode: false,
            titleMargin: false,
            titleMarginBottom: false,
            titleMarginEnd: false,
            titleMarginStart: false,
            titleMarginTop: false,
            tunerCount: false,
            use32bitAbi: false,
            version: false,
            windowBackgroundFallback: false
        },
        assign: {}
    },
    [BUILD_ANDROID.LOLLIPOP_1]: {
        android: {
            allowUndo: false,
            autoVerify: false,
            breakStrategy: false,
            colorBackgroundFloating: false,
            contextClickable: false,
            drawableTint: false,
            drawableTintMode: false,
            end: result => substitute(result, 'right'),
            extractNativeLibs: false,
            fingerprintAuthDrawable: false,
            fraction: false,
            fullBackupContent: false,
            hyphenationFrequency: false,
            lockTaskMode: false,
            logoDescription: false,
            numbersInnerTextColor: false,
            scrollIndicators: false,
            showForAllUsers: false,
            start: result => substitute(result, 'left'),
            subtitleTextColor: false,
            supportsAssist: false,
            supportsLaunchVoiceAssistFromKeyguard: false,
            thumbPosition: false,
            titleTextColor: false,
            trackTint: false,
            trackTintMode: false,
            usesCleartextTraffic: false,
            windowLightStatusBar: false
        },
        assign: {}
    },
    [BUILD_ANDROID.LOLLIPOP]: {
        android: {
            accessibilityTraversalAfter: false,
            accessibilityTraversalBefore: false,
            collapseContentDescription: false,
            dialogPreferredPadding: false,
            resizeClip: false,
            revisionCode: false,
            searchHintIcon: false
        },
        assign: {}
    },
    [BUILD_ANDROID.KITKAT_1]: {
        android: {
            actionBarPopupTheme: false,
            actionBarTheme: false,
            actionModeFindDrawable: false,
            actionModeShareDrawable: false,
            actionModeWebSearchDrawable: false,
            actionOverflowMenuStyle: false,
            amPmBackgroundColor: false,
            amPmTextColor: false,
            ambientShadowAlpha: false,
            autoRemoveFromRecents: false,
            backgroundTint: false,
            backgroundTintMode: false,
            banner: false,
            buttonBarNegativeButtonStyle: false,
            buttonBarNeutralButtonStyle: false,
            buttonBarPositiveButtonStyle: false,
            buttonTint: false,
            buttonTintMode: false,
            calendarTextColor: false,
            checkMarkTint: false,
            checkMarkTintMode: false,
            closeIcon: false,
            colorAccent: false,
            colorButtonNormal: false,
            colorControlActivated: false,
            colorControlHighlight: false,
            colorControlNormal: false,
            colorEdgeEffect: false,
            colorPrimary: false,
            colorPrimaryDark: false,
            commitIcon: false,
            contentAgeHint: false,
            contentInsetEnd: false,
            contentInsetLeft: false,
            contentInsetRight: false,
            contentInsetStart: false,
            controlX1: false,
            controlX2: false,
            controlY1: false,
            controlY2: false,
            country: false,
            datePickerDialogTheme: false,
            datePickerMode: false,
            dayOfWeekBackground: false,
            dayOfWeekTextAppearance: false,
            documentLaunchMode: false,
            elegantTextHeight: false,
            elevation: false,
            excludeClass: false,
            excludeId: false,
            excludeName: false,
            fastScrollStyle: false,
            fillAlpha: false,
            fillColor: false,
            fontFeatureSettings: false,
            foregroundTint: false,
            foregroundTintMode: false,
            fragmentAllowEnterTransitionOverlap: false,
            fragmentAllowReturnTransitionOverlap: false,
            fragmentEnterTransition: false,
            fragmentExitTransition: false,
            fragmentReenterTransition: false,
            fragmentReturnTransition: false,
            fragmentSharedElementEnterTransition: false,
            fragmentSharedElementReturnTransition: false,
            fromId: false,
            fullBackupOnly: false,
            goIcon: false,
            headerAmPmTextAppearance: false,
            headerDayOfMonthTextAppearance: false,
            headerMonthTextAppearance: false,
            headerTimeTextAppearance: false,
            headerYearTextAppearance: false,
            hideOnContentScroll: false,
            indeterminateTint: false,
            indeterminateTintMode: false,
            inset: false,
            isGame: false,
            launchTaskBehindSourceAnimation: false,
            launchTaskBehindTargetAnimation: false,
            layout_columnWeight: false,
            layout_rowWeight: false,
            letterSpacing: false,
            matchOrder: false,
            maxRecentsv: false,
            maximumAngle: false,
            minimumHorizontalAngle: false,
            minimumVerticalAngle: false,
            multiArch: false,
            navigationBarColor: false,
            navigationContentDescription: false,
            navigationIcon: false,
            nestedScrollingEnabled: false,
            numbersBackgroundColor: false,
            numbersSelectorColor: false,
            numbersTextColor: false,
            outlineProvider: false,
            overlapAnchor: false,
            paddingMode: false,
            pathData: false,
            patternPathData: false,
            persistableMode: false,
            popupElevation: false,
            popupTheme: false,
            progressBackgroundTint: false,
            progressBackgroundTintMode: false,
            progressTint: false,
            progressTintMode: false,
            propertyXName: false,
            propertyYName: false,
            queryBackground: false,
            recognitionService: false,
            relinquishTaskIdentity: false,
            reparent: false,
            reparentWithOverlay: false,
            restrictionType: false,
            resumeWhilePausing: false,
            reversible: false,
            searchIcon: false,
            searchViewStyle: false,
            secondaryProgressTint: false,
            secondaryProgressTintMode: false,
            selectableItemBackgroundBorderless: false,
            sessionService: false,
            setupActivity: false,
            showText: false,
            slideEdge: false,
            splitTrack: false,
            spotShadowAlpha: false,
            src(this: View, result: PlainObject) {
                if (this.svgElement) {
                    result['obj'] = 'app';
                    result['attr'] = 'srcCompat';
                }
                return true;
            },
            stackViewStyle: false,
            stateListAnimator: false,
            statusBarColor: false,
            strokeAlpha: false,
            strokeColor: false,
            strokeLineCap: false,
            strokeLineJoin: false,
            strokeMiterLimit: false,
            strokeWidth: false,
            submitBackground: false,
            subtitleTextAppearance: false,
            suggestionRowLayout: false,
            switchStyle: false,
            targetName: false,
            textAppearanceListItemSecondary: false,
            thumbTint: false,
            thumbTintMode: false,
            tileModeX: false,
            tileModeY: false,
            timePickerDialogTheme: false,
            timePickerMode: false,
            timePickerStyle: false,
            tintMode: false,
            titleTextAppearance: false,
            toId: false,
            toolbarStyle: false,
            touchscreenBlocksFocus: false,
            transitionGroup: false,
            transitionName: false,
            transitionVisibilityMode: false,
            translateX: false,
            translateY: false,
            translationZ: false,
            trimPathEnd: false,
            trimPathOffset: false,
            trimPathStart: false,
            viewportHeight: false,
            viewportWidth: false,
            voiceIcon: false,
            windowActivityTransitions: false,
            windowAllowEnterTransitionOverlap: false,
            windowAllowReturnTransitionOverlap: false,
            windowClipToOutline: false,
            windowContentTransitionManager: false,
            windowContentTransitions: false,
            windowDrawsSystemBarBackgrounds: false,
            windowElevation: false,
            windowEnterTransition: false,
            windowExitTransition: false,
            windowReenterTransition: false,
            windowReturnTransition: false,
            windowSharedElementEnterTransition: false,
            windowSharedElementExitTransition: false,
            windowSharedElementReenterTransition: false,
            windowSharedElementReturnTransition: false,
            windowSharedElementsUseOverlay: false,
            windowTransitionBackgroundFadeDuration: false,
            yearListItemTextAppearance: false,
            yearListSelectorColor: false
        },
        assign: {}
    },
    [BUILD_ANDROID.KITKAT]: {
        android: {
            allowEmbedded: false,
            windowSwipeToDismiss: false
        },
        assign: {}
    },
    [BUILD_ANDROID.JELLYBEAN_2]: {
        android: {
            accessibilityLiveRegion: false,
            addPrintersActivity: false,
            advancedPrintOptionsActivity: false,
            apduServiceBanner: false,
            autoMirrored: false,
            category: false,
            fadingMode: false,
            fromScene: false,
            isAsciiCapable: false,
            keySet: false,
            requireDeviceUnlock: false,
            ssp: false,
            sspPattern: false,
            sspPrefix: false,
            startDelay: false,
            supportsSwitchingToNextInputMethod: false,
            targetId: false,
            toScene: false,
            transition: false,
            transitionOrdering: false,
            vendor: false,
            windowTranslucentNavigation: false,
            windowTranslucentStatus: false
        },
        assign: {}
    },
    [BUILD_ANDROID.JELLYBEAN_1]: {
        android: {
            canRequestEnhancedWebAccessibility: (result, api) => api < BUILD_ANDROID.OREO,
            canRequestFilterKeyEvents: false,
            canRequestTouchExplorationMode: false,
            childIndicatorEnd: false,
            childIndicatorStart: false,
            indicatorEnd: false,
            indicatorStart: false,
            layoutMode: false,
            mipMap: false,
            mirrorForRtl: false,
            requiredAccountType: false,
            requiredForAllUsers: false,
            restrictedAccountType: false,
            windowOverscan: false
        },
        assign: {}
    },
    [BUILD_ANDROID.JELLYBEAN]: {
        android: {
            checkedTextViewStyle: false,
            format12Hour: false,
            format24Hour: false,
            initialKeyguardLayout: false,
            labelFor: false,
            layoutDirection: false,
            layout_alignEnd: result => substitute(result, 'layout_alignRight'),
            layout_alignParentEnd: result => substitute(result, 'layout_alignParentRight'),
            layout_alignParentStart: result => substitute(result, 'layout_alignParentLeft'),
            layout_alignStart: result => substitute(result, 'layout_alignLeft'),
            layout_marginEnd: result => substitute(result, 'layout_marginRight'),
            layout_marginStart: result => substitute(result, 'layout_marginLeft'),
            layout_toEndOf: result => substitute(result, 'layout_toRightOf'),
            layout_toStartOf: result => substitute(result, 'layout_toLeftOf'),
            listPreferredItemPaddingEnd: result => substitute(result, 'listPreferredItemPaddingRight'),
            listPreferredItemPaddingStart: result => substitute(result, 'listPreferredItemPaddingLeft'),
            paddingEnd: result => substitute(result, STRING_ANDROID.PADDING_RIGHT),
            paddingStart: result => substitute(result, STRING_ANDROID.PADDING_LEFT),
            permissionFlags: false,
            permissionGroupFlags: false,
            presentationTheme: false,
            showOnLockScreen: false,
            singleUser: false,
            subtypeId: false,
            supportsRtl: false,
            textAlignment: false,
            textDirection: false,
            timeZone: false,
            widgetCategory: false
        },
        assign: {}
    },
    [BUILD_ANDROID.ICE_CREAM_SANDWICH_1]: {
        android: {
            fontFamily: false,
            importantForAccessibility: false,
            isolatedProcess: false,
            keyboardLayout: false,
            mediaRouteButtonStyle: false,
            mediaRouteTypes: false,
            parentActivityName: false
        },
        assign: {}
    },
    [BUILD_ANDROID.ICE_CREAM_SANDWICH]: {
        android: {},
        assign: {}
    },
    [BUILD_ANDROID.ALL]: {
        android: {},
        assign: {
            Button: {
                android: {
                    textAllCaps: 'false'
                }
            }
        }
    }
};

export const DEPRECATED_ANDROID: Deprecations<View> = {
    android: {
        amPmBackgroundColor: (result, api) => substitute(result, 'headerBackground', api, BUILD_ANDROID.MARSHMALLOW),
        amPmTextColor: (result, api) => substitute(result, 'headerTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        animationResolution: (result, api) => api < BUILD_ANDROID.JELLYBEAN,
        anyDensity: (result, api) => api < BUILD_ANDROID.R,
        autoText: (result, api) => substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, 'textAutoCorrect'),
        canRequestEnhancedWebAccessibility: (result, api) => api < BUILD_ANDROID.OREO,
        capitalize: (result, api, value) => {
            switch (parseInt(value)) {
                case 1:
                    value = 'textCapSentences';
                    break;
                case 2:
                    value = 'textCapWords';
                    break;
                default:
                    return api < BUILD_ANDROID.JELLYBEAN;
            }
            return substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, value);
        },
        codes: (result, api) => api < BUILD_ANDROID.Q,
        dayOfWeekBackground: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        dayOfWeekTextAppearance: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        directionDescriptions: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        editable: (result, api) => substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, 'text'),
        enabled: (result, api) => api < BUILD_ANDROID.ICE_CREAM_SANDWICH_1,
        endYear: (result, api) => substitute(result, 'maxDate', api, BUILD_ANDROID.JELLYBEAN),
        fadingEdge: (result, api) => substitute(result, 'requiresFadingEdge', api, BUILD_ANDROID.ICE_CREAM_SANDWICH),
        focusedMonthDateColor: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        headerAmPmTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        headerDayOfMonthTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        headerMonthTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        headerTimeTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        headerYearTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        horizontalGap: (result, api) => api < BUILD_ANDROID.Q,
        iconPreview: (result, api) => api < BUILD_ANDROID.Q,
        inputMethod: (result, api) => substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, 'text'),
        isModifier: (result, api) => api < BUILD_ANDROID.Q,
        isRepeatable: (result, api) => api < BUILD_ANDROID.Q,
        isSticky: (result, api) => api < BUILD_ANDROID.Q,
        keyBackground: (result, api) => api < BUILD_ANDROID.Q,
        keyEdgeFlags: (result, api) => api < BUILD_ANDROID.Q,
        keyHeight: (result, api) => api < BUILD_ANDROID.Q,
        keyIcon: (result, api) => api < BUILD_ANDROID.Q,
        keyLabel: (result, api) => api < BUILD_ANDROID.Q,
        keyOutputText: (result, api) => api < BUILD_ANDROID.Q,
        keyPreviewHeight: (result, api) => api < BUILD_ANDROID.Q,
        keyPreviewLayout: (result, api) => api < BUILD_ANDROID.Q,
        keyPreviewOffset: (result, api) => api < BUILD_ANDROID.Q,
        keyTextColor: (result, api) => api < BUILD_ANDROID.Q,
        keyTextSize: (result, api) => api < BUILD_ANDROID.Q,
        keyWidth: (result, api) => api < BUILD_ANDROID.Q,
        keyboardMode: (result, api) => api < BUILD_ANDROID.Q,
        labelTextSize: (result, api) => api < BUILD_ANDROID.Q,
        numeric: (result, api) => substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, 'number'),
        password: (result, api) => substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, 'textPassword'),
        phoneNumber: (result, api) => substitute(result, 'inputType', api, BUILD_ANDROID.ICE_CREAM_SANDWICH_1, 'phone'),
        popupCharacters: (result, api) => api < BUILD_ANDROID.Q,
        popupKeyboard: (result, api) => api < BUILD_ANDROID.Q,
        popupLayout: (result, api) => api < BUILD_ANDROID.Q,
        protectionLevel: (result, api, value) => {
            switch (value) {
                case 'signatureOrSystem':
                case 'system':
                    return api < BUILD_ANDROID.MARSHMALLOW;
                default:
                    return true;
            }
        },
        restoreNeedsApplication: (result, api) => api < BUILD_ANDROID.ICE_CREAM_SANDWICH_1,
        rowEdgeFlags: (result, api) => api < BUILD_ANDROID.Q,
        searchButtonText: (result, api) => api < BUILD_ANDROID.ICE_CREAM_SANDWICH_1,
        selectedDateVerticalBar: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        selectedWeekBackgroundColor: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        sharedUserId: (result, api) => api < BUILD_ANDROID.Q,
        sharedUserLabel: (result, api) => api < BUILD_ANDROID.Q,
        showOnLockScreen: (result, api) => substitute(result, 'showForAllUsers', api, BUILD_ANDROID.MARSHMALLOW),
        showWeekNumber: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        shownWeekCount: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        startYear: (result, api) => substitute(result, 'minDate', api, BUILD_ANDROID.JELLYBEAN),
        state_long_pressable: (result, api) => api < BUILD_ANDROID.Q,
        targetDescriptions: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        targetProcesses: (result, api) => api < BUILD_ANDROID.Q,
        targetSandboxVersion: (result, api) => api < BUILD_ANDROID.Q,
        unfocusedMonthDateColor: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        verticalCorrection: (result, api) => api < BUILD_ANDROID.Q,
        verticalGap: (result, api) => api < BUILD_ANDROID.Q,
        weekNumberColor: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        weekSeparatorLineColor: (result, api) => api < BUILD_ANDROID.MARSHMALLOW,
        windowOverscan: (result, api) => api < BUILD_ANDROID.R,
        windowSwipeToDismiss: (result, api) => api < BUILD_ANDROID.R,
        yearListItemTextAppearance: (result, api) => substitute(result, 'yearListTextColor', api, BUILD_ANDROID.MARSHMALLOW),
        yearListSelectorColor: (result, api) => api < BUILD_ANDROID.MARSHMALLOW
    }
};

export function getValue(api: number, tagName: string, obj: string, attr: string) {
    for (const build of [API_ANDROID[api], API_ANDROID[0]]) {
        const value = build.assign[tagName]?.[obj]?.[attr];
        if (value) {
            return value;
        }
    }
    return '';
}