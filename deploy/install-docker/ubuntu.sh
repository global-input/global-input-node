sudo apt-get install apt-transport-https ca-certificates

curl -fsSL https://yum.dockerproject.org/gpg | sudo apt-key add -

sudo apt-get install software-properties-common

sudo add-apt-repository  "deb https://apt.dockerproject.org/repo/ ubuntu-$(lsb_release -cs) main"


sudo apt-get update

sudo apt-get -y install docker.io

sudo usermod -a -G docker dilshat

echo "you need to ssh login back in to make the group permissin take effect"


sudo apt-get install unzip

apt-get update

sudo apt-get -y install python-pip

sudo apt-get install python-setuptools

sudo apt-get install python3-setuptools

sudo pip install docker-compose





