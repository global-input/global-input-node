targethost=dev.iterativesolution.co.uk
targetuser=root

#sourcejar="build/libs/global-input-0.0.1-SNAPSHOT.jar"
sourcejar="target/global-input-0.0.1-SNAPSHOT.jar"

basedir="/data/websites/iterativesolution"

upload(){
   scp $1   $targetuser@$targethost:$basedir/$2
}
executeScript(){
    ssh $targetuser@$targethost ''$1''
}

executeScript "mkdir $basedir/global-input"

upload $sourcejar  global-input
upload src/main/docker/Dockerfile  global-input

upload start.sh global-input

executeScript "cd $basedir/global-input && docker build ."

executeScript "cd $basedir/global-input && docker build -t dilshat/global-input ."

executeScript "cd $basedir/global-input && ./start.sh"
