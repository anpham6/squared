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
			##render-start##
			<group android:name="{~groupName}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
			##render-start##
			<<clipGroup>>
			<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
			<<clipGroup>>
			<<CCC>>
				<<clipElement>>
				<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
				<<clipElement>>
				<path android:name="{~name}" android:fillColor="{~fill}" android:fillAlpha="{~fillOpacity}" android:fillType="{~fillRule}" android:strokeColor="{~stroke}" android:strokeAlpha="{~strokeOpacity}" android:strokeWidth="{~strokeWidth}" android:strokeLineCap="{~strokeLinecap}" android:strokeLineJoin="{~strokeLinejoin}" android:strokeMiterLimit="{~strokeMiterlimit}" android:trimPathStart="{~trimPathStart}" android:trimPathEnd="{~trimPathEnd}" android:trimPathOffset="{~trimPathOffset}" android:pathData="{&value}">
				<<fillPattern>>
					<aapt:attr name="android:fillColor">
					<<gradients>>
						<gradient android:type="{&type}" android:startColor="{~startColor}" android:endColor="{~endColor}" android:centerColor="{~centerColor}" android:startX="{~startX}" android:startY="{~startY}" android:endX="{~endX}" android:endY="{~endY}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" android:tileMode="{~tileMode}">
						<<colorStops>>
							<item android:offset="{&offset}" android:color="{&color}" />
						<<colorStops>>
						</gradient>
					<<gradients>>
					</aapt:attr>
				<<fillPattern>>
				</path>
			<<CCC>>
			##render-end##
			</group>
			##render-end##
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