#!/bin/bash
set -e
set -o errexit
set -o pipefail
set -o nounset


echo "- Current Build Profile: $BUILD_PROFILE"

cd $APP_PATH

if [ "$BUILD_PROFILE" = "staging" ]; then
npm run start

elif [ "$BUILD_PROFILE" = "production" ]; then
npm run start

fi