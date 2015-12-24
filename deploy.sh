#!/bin/bash

rm -rf ./html
echo "building app..."
brunch build --production
echo "deploying app to production server..."
rsync -au ./html cosmonaut@vapor.fm:/var/www/
echo "cleaning up..."
rm -rf ./html
echo "done!"
