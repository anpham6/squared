export const PARTIAL_FILLREPEAT = `<<fillBefore>>
	<set>
	<<values>><<values>>
	</set>
<<fillBefore>>
<<repeating>>
	<objectAnimator
		android:propertyName="{~propertyName}"
		android:interpolator="{~interpolator}"
		android:valueType="{~valueType}"
		android:valueFrom="{~valueFrom}"
		android:valueTo="{~valueTo}"
		android:startOffset="{~startOffset}"
		android:duration="{&duration}"
		android:repeatCount="{&repeatCount}">
	<<propertyValues>>
		<propertyValuesHolder android:propertyName="{&propertyName}">
		<<keyframes>>
			<keyframe android:interpolator="{~interpolator}" android:fraction="{~fraction}" android:value="{~value}" />
		<<keyframes>>
		</propertyValuesHolder>
	<<propertyValues>>
	</objectAnimator>
<<repeating>>
<<fillCustom>>
	<set android:ordering="{~ordering}">
	<<values>><<values>>
	</set>
<<fillCustom>>
<<fillAfter>>
	<set>
	<<values>>
		<objectAnimator
			android:propertyName="{&propertyName}"
			android:interpolator="{~interpolator}"
			android:valueType="{~valueType}"
			android:valueFrom="{~valueFrom}"
			android:valueTo="{&valueTo}"
			android:startOffset="{~startOffset}"
			android:duration="{&duration}"
			android:repeatCount="{&repeatCount}" />
	<<values>>
	</set>
<<fillAfter>>`;

export default `<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android" android:ordering="{~ordering}">
${PARTIAL_FILLREPEAT}
</set>
`;