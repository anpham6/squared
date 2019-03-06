export default `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
<<A>>
	<stroke android:width="{&width}" {~borderStyle} />
<<A>>
<<B>>
	<solid android:color="@color/{&color}" />
<<B>>
<<C>>
	<corners android:radius="{~radius}" android:topLeftRadius="{~topLeftRadius}" android:topRightRadius="{~topRightRadius}" android:bottomLeftRadius="{~bottomLeftRadius}" android:bottomRightRadius="{~bottomRightRadius}" />
<<C>>
</shape>`;