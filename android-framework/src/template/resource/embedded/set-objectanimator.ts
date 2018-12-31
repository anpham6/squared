export default `
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
!1
	<set android:ordering="{~ordering}">
!2
		<set android:ordering="{~ordering}">
!objectAnimators
			<objectAnimator
				android:propertyName="{~propertyName}"
				android:valueType="{~valueType}"
				android:valueFrom="{~valueFrom}"
				android:valueTo="{~valueTo}"
				android:duration="{~duration}"
				android:repeatCount="{&repeatCount}"
				android:repeatMode="{~repeatMode}"
				android:startOffset="{~startOffset}"
				android:interpolator="{~interpolator}"
				android:fillAfter="{~fillAfter}"
				android:fillBefore="{~fillBefore}"
				android:fillEnabled="{~fillEnabled}">
!propertyValues
				<propertyValuesHolder android:propertyName="{&propertyName}">
!keyframes
					<keyframe android:fraction="{~fraction}" android:value="{~value}" />
!keyframes
				</propertyValuesHolder>
!propertyValues
			</objectAnimator>
!objectAnimators
		</set>
!fill
		<set>
!replace
			<objectAnimator
				android:propertyName="{&propertyName}"
				android:valueType="{~valueType}"
				android:valueFrom="{~valueFrom}"
				android:valueTo="{&valueTo}"
				android:duration="{~duration}"
				android:repeatCount="{~repeatCount}" />
!replace
		</set>
!fill
!2
	</set>
!1
</set>`;