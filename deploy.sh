#!/bin/bash

rm -rf ./html
echo "building app..."
brunch build --production
echo "deploying app to production server..."
rsync -r ./html/ cosmonaut@168.235.77.138:/var/www/
echo "cleaning up..."
rm -rf ./html
echo "done!"
