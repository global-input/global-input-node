echo "The target system should have unzip installed..."
echo "Also need to run the command 'docker network create iterativesolution_default'"
echo "If you have already have docker container named nginx, you need to remove it first by running 'docker rm -f nginx'"
export deploy_to_hostname="$1"
export deploy_to_username="$2"
export projectversion="$3"
export targetenv="$4"

source deploy/util.sh
buildVariables
echo "creating folder..."
createFolders
echo "uplading the zip file..."
uploadZipFile
echo "unziping ..."
unzipZipFile
echo "shell script ..."
makeSchellScriptExecutable
echo "uploading the ssl certificates ..."
uploadSSLCertificated
echo "starting the docker containers..."
buildAndStartDocker
