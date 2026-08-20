#!/bin/bash

if [[ $VERCEL_ENV == "production" ]] ; then
  npm run build
elif [[ $VERCEL_GIT_COMMIT_REF == "test" ]] ; then
  npm run build:test
else
  echo "Skipping build: deployments are only enabled for the main and test branches (got '$VERCEL_GIT_COMMIT_REF')."
  exit 1
fi
