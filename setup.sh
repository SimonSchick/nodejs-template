#!/bin/bash

function pause(){
   read -p "$*"
}

rm -rf .git

echo You may apply git to this folder now
pause "Press [Enter] key to continue"

echo Please enter project name
read projectName

sed "s/%NAME%/$projectName/g" -i readme.md

echo Please enter git username
read username

sed "s/%USERNAME%/$username/g" -i readme.md

npm init
