export default `
<?xml version="1.0" encoding="utf-8"?>
<resources>
	<style name="{&appTheme}" parent="{~parentTheme}">
		<item name="android:windowDrawsSystemBarBackgrounds">true</item>
		<item name="android:statusBarColor">@android:color/transparent</item>
		<item name="android:windowTranslucentStatus">true</item>
    <<AA>>
		<item name="{&name}">{&value}</item>
    <<AA>>
	</style>
</resources>`;