cd $HOME/Documents
# cd /home/steamdeck/Documents

mdkir SteamBrew
cd SteamBrew

# install and extract nodejs binary
curl https://nodejs.org/dist/v16.15.0/node-v16.15.0-linux-x64.tar.xz --output nodearchive.tar.xz
tar -xf nodearchive.tar.xz
rm nodearchive.tar.xz

# add it to path

# check path exists
if test -f ""; then
    # exists
else 
    touch $HOME/.profile
fi

# add it to profile 
export PATH=$PATH:$HOME/Documents/SteamBrew/node-v16.15.0-linux-x64/bin
printf "\n export PATH=$PATH:$HOME/Documents/SteamBrew/node-v16.15.0-linux-x64/bin \n" >> $HOME/testprofile

# download steambrew from github releases


# create a service pointing to steambrew and start it

# make a request to steambrew to check if its working