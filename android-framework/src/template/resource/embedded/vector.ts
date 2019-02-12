export default `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" {~namespace} android:name="{~name}" android:width="{&width}" android:height="{&height}" android:viewportWidth="{&viewportWidth}" android:viewportHeight="{&viewportHeight}" android:alpha="{~alpha}">
<<A>>
	##region-start##
	<group android:name="{~groupName}" android:translateX="{~translateX}" android:translateY="{~translateY}">
	##region-start##
	<<clipRegion>>
		<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
	<<clipRegion>>
		##path-start##
		<group android:name="{~groupName}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
		##path-start##
			<<clipPath>>
			<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
			<<clipPath>>
			<<BB>>
				<<CCC>>
				##render-start##
				<group android:name="{~groupName}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
				##render-start##
					<<clipElement>>
					<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
					<<clipElement>>
					<path android:name="{~name}" android:fillColor="{~fill}" android:fillAlpha="{~fillOpacity}" android:fillType="{~fillRule}" android:strokeColor="{~stroke}" android:strokeAlpha="{~strokeOpacity}" android:strokeWidth="{~strokeWidth}" android:strokeLineCap="{~strokeLinecap}" android:strokeLineJoin="{~strokeLinejoin}" android:strokeMiterLimit="{~strokeMiterlimit}" android:pathData="{&value}">
					<<fillPattern>>
						<aapt:attr name="android:fillColor">
						<<gradients>>
							<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:startX="{~startX}" android:startY="{~startY}" android:endX="{~endX}" android:endY="{~endY}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" android:tileMode="{~tileMode}">
							<<colorStops>>
								<item android:offset="{&offset}" android:color="{&color}" />
							<<colorStops>>
							</gradient>
						<<gradients>>
						</aapt:attr>
					<<fillPattern>>
					</path>
				##render-end##
				</group>
				##render-end##
				<<CCC>>
				<<DDD>>
				!!{&templateName}!!
				<<DDD>>
			<<BB>>
		##path-end##
		</group>
		##path-end##
	##region-end##
	</group>
	##region-end##
<<A>>
<<B>>
!!{&templateName}!!
<<B>>
</vector>`;