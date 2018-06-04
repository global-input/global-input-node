source deploy/util.sh

git add .
git commit -m "releasing"
mvn gitflow:release-start
mvn gitflow:release-finish
git checkout  master
getProjectVersionFromPom
git checkout develop
echo $projectversion >/tmp/global_input_node_deploy_version.txt
displayDeploymentHelp releasing
