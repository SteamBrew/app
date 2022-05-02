#!/usr/bin/env bash

# script should be run from /SteamBrew/ not SteamBrew/scripts

cd manager
npm ci 
npm run build

rm -rf \
    node_modules \
    public \
    src \
    package.json \
    package-lock.json \
    README.md \
    src \
    public \