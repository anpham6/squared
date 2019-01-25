export default `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" {~namespace} android:name="{&name}" android:width="{&width}" android:height="{&height}" android:viewportWidth="{&viewportWidth}" android:viewportHeight="{&viewportHeight}" android:alpha="{~alpha}">
<<A>>
	##group-start##
	<group android:name="{~groupName}" android:rotation="{~rotation}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}">
	##group-start##
		<<clipGroup>>
		<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
		<<clipGroup>>
		<<BB>>
			<<CCC>>
			##render-start##
			<group android:name="{~groupName}" android:rotation="{~rotation}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}">
			##render-start##
				<<clipElement>>
				<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
				<<clipElement>>
				<path android:name="{~name}" android:pathData="{&value}" android:fillColor="{~fill}" android:fillAlpha="{~fillOpacity}" android:fillType="{~fillRule}" android:strokeColor="{~stroke}" android:strokeAlpha="{~strokeOpacity}" android:strokeWidth="{~strokeWidth}" android:strokeLineCap="{~strokeLinecap}" android:strokeLineJoin="{~strokeLinejoin}" android:strokeMiterLimit="{~strokeMiterlimit}">
				<<fillPattern>>
					<aapt:attr name="android:fillColor">
					<<gradients>>
						<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:startX="{~startX}" android:startY="{~startY}" android:endX="{~endX}" android:endY="{~endY}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}">
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
	##group-end##
	</group>
	##group-end##
<<A>>
<<B>>
!!{&templateName}!!
<<B>>
</vector>`;