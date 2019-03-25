import { PARTIAL_FILLREPEAT } from './objectanimator';

const $xml = squared.lib.xml;

export default `<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
<<A>>
	<set android:ordering="{~ordering}">
	<<AA>>
		<set android:ordering="{~ordering}">
${$xml.pushIndent(PARTIAL_FILLREPEAT, 2)}
		</set>
	<<AA>>
	<<BB>>
		<<together>>
		<objectAnimator
			android:propertyName="{&propertyName}"
			android:interpolator="{~interpolator}"
			android:valueType="{~valueType}"
			android:valueFrom="{~valueFrom}"
			android:valueTo="{&valueTo}"
			android:startOffset="{~startOffset}"
			android:duration="{&duration}"
			android:repeatCount="{&repeatCount}" />
		<<together>>
	<<BB>>
	</set>
<<A>>
</set>
`;