#!/bin/bash
# Builds protofiles

cd proto

docker build --tag=proto-compiler-img .

docker create --name proto_compiler proto-compiler-img 

# Remove existing build folders
rm -rf ../device/protobuild
rm -rf ../api/protobuild
rm -rf ../web/protobuild

# Copy generated files to specific locations
#docker cp proto_compiler:/service/build/c/ ../device/protobuild/
docker cp proto_compiler:/service/build/python/ ../api/protobuild/
docker cp proto_compiler:/service/build/typescript/ ../web/protobuild/

docker rm -f proto_compiler
