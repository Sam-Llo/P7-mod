rm -f ./assets/default/default/default/layout/*.json;

cp $1/gamelayout_portrait.json ./assets/default/default/default/layout/portrait.json;
cp $1/gamelayout_desktop.json ./assets/default/default/default/layout/landscape.json;
cp $1/gamelayout_mini.json ./assets/default/default/default/layout/mini.json;

rm -f ./assets/default/default/mobile/layout/*.json;
cp $1/gamelayout_portrait.json ./assets/default/default/mobile/layout/portrait.json;

rm -f ./assets/default/default/desktop/layout/*.json;
cp $1/gamelayout_mini.json ./assets/default/default/desktopmini/layout/landscape.json;

rm -f ./assets/default/default/default/sprites/*.json;
rm -f ./assets/default/default/default/sprites/*.png;

#rm -f ./assets/default/default/mobile/sprites/*.json;
#rm -f ./assets/default/default/mobile/sprites/*.png;

#rm -f ./assets/default/default/desktopmini/sprites/*.json;
#rm -f ./assets/default/default/desktopmini/sprites/*.png;


for x in $1/gamebitmaps-*;
do 
cp $x assets/default/default/default/sprites/;
cp $x assets/default/default/mobile/sprites/;
cp $x assets/default/default/desktopmini/sprites/;
done;

rm -f ./assets/default/default/default/spine/*.*
rm -f ./assets/default/default/mobile/spine/*.*
rm -f ./assets/default/default/desktopmini/spine/*.*

for x in $1/spine/*.*
do
cp $x assets/default/default/default/spine/;
cp $x assets/default/default/mobile/spine/;
cp $x assets/default/default/desktopmini/spine/;
done;

rm -f assets/default/default/styles/*.*
cp -f $1/../translations/en/desktop/landscapeStyle.json ./assets/default/default/default/styles/landscapeStyle.json
cp -f $1/../translations/en/desktop/styles.json ./assets/default/default/default/styles/styles.json
cp -f $1/../translations/en/portrait/portraitStyle.json ./assets/default/default/default/styles/portraitStyle.json

cp -f $1/../translations/en/mini/landscapeStyle.json ./assets/default/default/desktopmini/styles/landscapeStyle.json

cp -f $1/../translations/en/portrait/portraitStyle.json ./assets/default/default/mobile/styles/portraitStyle.json
cp -f $1/../translations/en/desktop/landscapeStyle.json ./assets/default/default/mobile/styles/landscapeStyle.json
cp -f $1/../translations/en/desktop/styles.json ./assets/default/default/mobile/styles/styles.json