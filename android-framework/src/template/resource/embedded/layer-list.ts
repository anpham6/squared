export default `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
<<A>>
	<item>
		<shape android:shape="rectangle">
			<solid android:color="@color/{&color}" />
		</shape>
	</item>
<<A>>
<<B>>
	<item android:left="{~left}" android:top="{~top}" android:right="{~right}" android:bottom="{~bottom}" android:drawable="@drawable/{~src}" android:width="{~width}" android:height="{~height}">
	<<gradient>>
		<shape android:shape="rectangle">
			<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:angle="{~angle}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" android:visible="{~visible}" />
		</shape>
	<<gradient>>
	<<bitmap>>
		<bitmap android:src="@drawable/{&src}" android:gravity="{~gravity}" android:tileMode="{~tileMode}" android:tileModeX="{~tileModeX}" android:tileModeY="{~tileModeY}" />
	<<bitmap>>
	<<rotate>>
		<rotate android:drawable="@drawable/{&src}" android:fromDegrees="{~fromDegrees}" android:toDegrees="{~toDegrees}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}" android:visible="{~visible}" />
	<<rotate>>
	</item>
<<B>>
<<C>>
	<item android:left="{~left}" android:top="{~top}" android:right="{~right}" android:bottom="{~bottom}">
		<shape android:shape="rectangle">
		<<stroke>>
			<stroke android:width="{&width}" {~borderStyle} />
		<<stroke>>
		<<corners>>
			<corners android:radius="{~radius}" android:topLeftRadius="{~topLeftRadius}" android:topRightRadius="{~topRightRadius}" android:bottomRightRadius="{~bottomRightRadius}" android:bottomLeftRadius="{~bottomLeftRadius}" />
		<<corners>>
		</shape>
	</item>
<<C>>
</layer-list>`;