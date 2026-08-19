#!/bin/bash

if [[ $VERCEL_ENV == "production" ]] ; then
  npm run build
elif [[ $VERCEL_GIT_COMMIT_REF == "stage" ]] ; then
  npm run build:stage
elif [[ $VERCEL_GIT_COMMIT_REF != "main" ]] ; then
  npm run build:test
fi
