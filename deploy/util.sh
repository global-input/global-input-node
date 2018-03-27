projectName="global-input-node"

getProjectVersionFromPom(){
  projectversion=`grep -A 0 -B 2 "<packaging>" pom.xml  | grep version  | cut -d\> -f 2 | cut -d\< -f 1`
  export projectversion
}

buildVariables(){
  export zipfilename="$projectName-$projectversion.zip"
  export sourcezipfilepath="package/target/$zipfilename"
  export destzipfolder="$projectName"
}

executeScript(){
   echo "executing the script $1 remotely  on  $deploy_to_username@$deploy_to_hostname "
   ssh $deploy_to_username@$deploy_to_hostname 'bash -s' < $1
   echo "remote execution completed"
}
createDockerNetwork(){
   echo "creating network on on  $deploy_to_username@$deploy_to_hostname "
   ssh $deploy_to_username@$deploy_to_hostname "docker network create iterativesolution_default"

}
executeDeployedScriptOnServer(){
   echo "executing the deployed script $1 remotely  on  $deploy_to_username@$deploy_to_hostname "
   ssh $deploy_to_username@$deploy_to_hostname "cd $destzipfolder && ./$1"
   echo "remote execution completed"
}


createFolders(){
    createUniqueidforfilename
    echo "creating the script for creating folder: /tmp/script_$uniqueidforfilename.sh"
    echo "mkdir -p $destzipfolder" > /tmp/script_$uniqueidforfilename.sh
    echo "mkdir -p $destzipfolder/node/app" > /tmp/script_$uniqueidforfilename.sh
    echo "mkdir -p $destzipfolder/nginx/etc/nginx/ssl" > /tmp/script_$uniqueidforfilename.sh
    executeScript /tmp/script_$uniqueidforfilename.sh
}

uploadZipFile(){
    echo "uploading the $sourcezipfilepath to  $deploy_to_username@$deploy_to_hostname:$destzipfolder/"
    scp $sourcezipfilepath $deploy_to_username@$deploy_to_hostname:$destzipfolder/
}


uploadSSLCertificated(){
    echo "executing:rsync -azvv ../global-input-secrets/$targetenv/letsencrypt/ $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/letsencrypt/"
    rsync -azvv ../global-input-secrets/$targetenv/letsencrypt/ $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/letsencrypt/
    echo "rsync -azvv ../global-input-secrets/$targetenv/letsencrypt/ $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/letsencrypt/"
    rsync -azvv ../global-input-secrets/$targetenv/node4567/letsencrypt/ $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/node4567/

    scp ../global-input-secrets/$targetenv/godaddy/* $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/nginx/ssl/
    scp ../global-input-secrets/$targetenv/csr/globalinput.co.uk.key $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/nginx/ssl/globalinput.co.uk.key
    scp ../global-input-secrets/$targetenv/dhparam.pem $deploy_to_username@$deploy_to_hostname:$destzipfolder/nginx/etc/nginx/ssl/
    createUniqueidforfilename
    echo "creating crt file"
    echo "cat $destzipfolder/nginx/etc/nginx/ssl/397143f89bd4800b.crt > $destzipfolder/nginx/etc/nginx/ssl/globalinput.co.uk.crt" > /tmp/script_$uniqueidforfilename.sh
    echo "cat $destzipfolder/nginx/etc/nginx/ssl/gd_bundle-g2-g1.crt >> $destzipfolder/nginx/etc/nginx/ssl/globalinput.co.uk.crt" >> /tmp/script_$uniqueidforfilename.sh
    executeScript /tmp/script_$uniqueidforfilename.sh

}

unzipZipFile(){
      createUniqueidforfilename
      unzipAndReplaceVariables $uniqueidforfilename
      executeScript /tmp/script_$uniqueidforfilename.sh
}

unzipAndReplaceVariables(){
    uniqueidforfilename=$1

    echo "creating the script:/tmp/script_$uniqueidforfilename.sh"
    echo "cd $destzipfolder" > /tmp/script_$uniqueidforfilename.sh
    echo "unzip -o $zipfilename" >> /tmp/script_$uniqueidforfilename.sh

    #echo  'sed -i -e "s,@@@db_user@@@,'$db_user',g" mysql/box-scripts/mysql.env' >> /tmp/script_$uniqueidforfilename.sh


}
makeSchellScriptExecutable(){
    createUniqueidforfilename
    createSCriptFormakeSchellScriptExecutable $uniqueidforfilename

    executeScript /tmp/script_$uniqueidforfilename.sh
}

createSCriptFormakeSchellScriptExecutable(){
    uniqueidforfilename=$1
    echo "creating the script for making executable: /tmp/script_$uniqueidforfilename.sh"
    echo "cd  $destzipfolder && chmod u+x *.sh" > /tmp/script_$uniqueidforfilename.sh


}

createDeployScript(){
    echo "source $3" > deploy/deploy_to_$1.sh
    echo 'echo "deploying the version '$2' to '$5'@'$4' using the property file '$3' (for replacement of the environment specific variables) ..."' >>  deploy/deploy_to_$1.sh
    echo "deploy/deploy.sh $4 $5 $2 $1" >> deploy/deploy_to_$1.sh
    chmod u+x deploy/deploy_to_$1.sh


    echo "source $3" > deploy/create_network_$1.sh
    echo "deploy/create_network.sh $4 $5 $2" >> deploy/create_network_$1.sh
    chmod u+x deploy/create_network_$1.sh


    echo "source $3" > deploy/update_$1.sh
    echo "deploy/update.sh $4 $5 $2" >> deploy/update_$1.sh
    chmod u+x deploy/update_$1.sh
}


createUniqueidforfilename(){
  if [ -z "${uniqueidforfilename+x}" ]
  then
        uniqueidforfilename=$(date +%s)

 else
        export uniqueidforfilename=$((uniqueidforfilename+1))
 fi
}

copyTheAppToDockerFolder(){
    createUniqueidforfilename
    echo "creating the script for copyTheAppToDockerFolder: /tmp/script_$uniqueidforfilename.sh"
    echo "rsync -azvv  $destzipfolder/app/ $destzipfolder/node/app/" > /tmp/script_$uniqueidforfilename.sh
    executeScript /tmp/script_$uniqueidforfilename.sh
}


buildAndStartDocker(){
    executeDeployedScriptOnServer start.sh
}
restartDocker(){
    executeDeployedScriptOnServer restart.sh
}
