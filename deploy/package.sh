source deploy/util.sh
mvn package
getProjectVersionFromPom

echo $projectversion >/tmp/global_input_node_deploy_version.txt
displayDeploymentHelp packaging
