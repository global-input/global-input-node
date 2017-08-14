export deploy_to_hostname="$1"
export deploy_to_username="$2"
export projectversion="$3"
export targetenv="$4"

source deploy/util.sh
buildVariables
createFolders
uploadZipFile
unzipZipFile
makeSchellScriptExecutable


restartDocker
