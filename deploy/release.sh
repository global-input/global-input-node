source deploy/util.sh

git add .
git commit -m "releasing"
mvn jgitflow:release-start
mvn jgitflow:release-finish
git checkout  master
getProjectVersionFromPom
git checkout develop
