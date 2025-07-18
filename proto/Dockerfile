FROM ubuntu:22.04
RUN apt update
RUN apt-get update && apt-get install -y \
    autoconf automake libtool curl make g++ unzip \
    python3 \
    python3-pip \
    python3-protobuf \
    git

RUN pip3 install --upgrade pip setuptools protobuf grpcio-tools

# Install Node.js for TypeScript generation
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g @protobuf-ts/plugin

WORKDIR /service

# Install protoc
ADD https://github.com/protocolbuffers/protobuf/releases/download/v21.4/protoc-21.4-linux-x86_64.zip ./
RUN unzip protoc-21.4-linux-x86_64.zip
ENV PATH="${PATH}:/service/bin"

# Install nanopb
ARG nanopbfile=nanopb-0.4.6-linux-x86
ADD https://jpa.kapsi.fi/nanopb/download/$nanopbfile.tar.gz ./
RUN tar -xvf $nanopbfile.tar.gz

COPY *.proto *.options ./ 

# build proto files for C
RUN mkdir -p build/c
RUN python3 $nanopbfile/generator/nanopb_generator.py jantteri_messages.proto
RUN cp $nanopbfile/*.c build/c/
RUN cp $nanopbfile/*.h build/c/
RUN cp *.c build/c/
RUN cp *.h build/c/

# build proto files for python
RUN mkdir -p build/python
RUN protoc -I=. -I=./$nanopbfile/generator/proto/ --python_out=build/python jantteri_messages.proto
RUN cp $nanopbfile/generator/proto/nanopb_pb2.py build/python/

# Create __init__.py file to make python directory a Python package
RUN echo "# This file makes the python directory a Python package" > build/python/__init__.py

# build proto files for TypeScript
RUN mkdir -p build/typescript
RUN protoc --ts_out build/typescript --proto_path . jantteri_messages.proto