#!/usr/bin/env bash

REPO="anyproto/anytype-heart"
FILE="addon.tar.gz"
GITHUB="api.github.com"

platform=${1:-ubuntu-latest};
arch=$2;
folder="build";

if [ "$platform" = "ubuntu-latest" ] || [ "$platform" = "ubuntu-22.04" ]; then
  arch="linux-$arch";
  folder="$arch";
elif [ "$platform" = "macos-13" ] || [ "$platform" = "macos-latest" ]; then
  arch="darwin-$arch";
  folder="$arch";
elif [ "$platform" = "windows-latest" ]; then
  arch="windows";
  folder="dist";
  FILE="addon.zip"
fi;

echo "Platform: $platform"
echo "Arch: $arch"
echo "Folder: $folder"
echo ""

if [ "$arch" = "" ]; then
  echo "ERROR: arch not found"
  exit 1
fi;

mwv=`cat middleware.version`

version=`curl -H "Accept: application/vnd.github.v3+json" -sL https://$GITHUB/repos/$REPO/releases/tags/v$mwv | jq .`

tag=`echo $version | jq ".tag_name"`
asset_id=`echo $version | jq ".assets | map(select(.name | match(\"js_v[0-9]+.[0-9]+.[0-9]+([^_]+)?_$arch\";\"i\")))[0].id"`

if [ "$asset_id" = null ]; then
  echo "ERROR: version not found"
  exit 1
fi;

printf "Version: $tag\n"
printf "Found asset: $asset_id\n"

# Récupération de l'URL de téléchargement réelle
echo -n "Fetching download URL..."
download_url=$(curl -sL -H "Accept: application/vnd.github.v3+json" "https://$GITHUB/repos/$REPO/releases/assets/$asset_id" | jq -r '.browser_download_url')

if [ -z "$download_url" ] || [ "$download_url" = "null" ]; then
  echo "Error: Unable to retrieve download URL"
  exit 1
fi
printf "Done\n"

# Téléchargement du fichier
echo -n "Downloading file from $download_url..."
curl -sL -o "$FILE" "$download_url"
printf "Done\n"

if [ "$platform" = "windows-latest" ]; then
  echo -n "Uncompressing... "
  tar -xzf $FILE
  printf "Done\n"
  
  echo "Moving... "
  mv -fv grpc-server.exe "$folder/anytypeHelper.exe"
else 
  echo -n "Uncompressing... " 
  tar -zxf $FILE
  printf "Done\n"

  echo "Moving... "
  rm -rf "$folder"
  mkdir -p "$folder"
  mv -fv grpc-server "$folder/anytypeHelper"
fi;

rm -rf dist/lib/pb
rm -rf dist/lib/pkg
rm -rf dist/lib/protos
rm -rf dist/lib/json/generated/*.json

mv -fv protobuf/* "dist/lib/"
mkdir -p dist/lib/json/generated
mv -fv json/* "dist/lib/json/generated"
rm -rf protobuf
rm -rf relations
rm -rf json
rm -rf $FILE

printf "Done\n\n"
