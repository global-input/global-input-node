source /Users/dilshathewzulla/workspace/global-input/global-input-secrets/prod.sh
echo "deploying the version 1.1.27-SNAPSHOT to root@udinput.co.uk using the property file /Users/dilshathewzulla/workspace/global-input/global-input-secrets/prod.sh (for replacement of the environment specific variables) ..."
deploy/deploy.sh udinput.co.uk root 1.1.27-SNAPSHOT dev
