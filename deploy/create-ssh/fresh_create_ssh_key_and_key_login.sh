createUniqueidforfilename(){
  if [ -z "${uniqueidforfilename+x}" ] 
  then 
        uniqueidforfilename=$(date +%s)
     
 else
        export uniqueidforfilename=$((uniqueidforfilename+1))
 fi
}


createUniqueidforfilename

ssh $2@$1 "cp .ssh/id_rsa .ssh/backupid_rsa.$uniqueidforfilename"
ssh $2@$1 "cp .ssh/id_rsa.pub .ssh/backupid_rsa.pub.$uniqueidforfilename"
  
ssh $2@$1 "ssh-keygen -t rsa"

scp ~/.ssh/id_rsa.pub $2@$1:/tmp/$uniqueidforfilename.txt

ssh $2@$1 "cp .ssh/authorized_keys .ssh/authorized_keys.$uniqueidforfilename"

ssh $2@$1 "cat /tmp/$uniqueidforfilename.txt > .ssh/authorized_keys"