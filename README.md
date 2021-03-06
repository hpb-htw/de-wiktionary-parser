# De Wiktionary Parser

[![Build status](https://ci.appveyor.com/api/projects/status/3l5ja20lgqkl2eex?svg=true)](https://ci.appveyor.com/project/hpb-htw/de-wiktionary-parser)
[![codecov](https://codecov.io/gh/hpb-htw/de-wiktionary-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/hpb-htw/de-wiktionary-parser)


This package provides a CLI command to convert the dump file (from 
https://dumps.wikimedia.org/backup-index.html) to a CSV file.
The CSV file can the be imported to a SQLite3 by 
executable commands of project `dxtionary-db`.

This package is design to be used to prepare data for `dxtionary` Extension
before it ready to be distributed. Therefore it is mostly used by developer.

## Install / Setup project

This package uses the NodeJS-package `lib-expat` to parser XML files, which depends on 
a C++ Compiler. So it works well on a linux with well-configured 
[node-gyp](https://github.com/nodejs/node-gyp).
Unfortunately I don't have time to test this package on others systems. 

## Build

This project's `packgae.json` delegates build tasks to Makefile to keep scripting manageable. To build
necessary files just run: 

```bash
npm run compile
```

It will take some time to generate a CSV file from Wiki Dump file.

## Usage

1. Download the dump file from https://dumps.wikimedia.org/backup-index.html 
   → (Choose a Mirror) 
   → `dumps/dewiki/` 
   → some version, this version is now referenced as `${version}`
   → `dewiki-${version}-pages-articles.xml.bz2`
2. Extract the download pages somewhere, it takes approximated more than 1.3 GB.
3. Run the command `node lib/index.js`. 

*  Syntax:

```
node lib/index.js <dump.xml> <separator> > <output>.csv
```

* Example: To create a CSV file `rawdata.csv` with use the string `<separator>` as separator-token,
we can use this command:

```
node lib/index.js dewiktionary-20191020-pages-articles.xml "<separator>" > rawdata.csv
```

* Example: To make a `gz` file (easier to distribute)

```
node lib/index.js dewiktionary-20191020-pages-articles.xml "<separator>" | gzip -f - > rawdata.csv.gz
```

## Description of output CSV file

Example output:

```csv
# origin file dewiktionary-20191020-pages-articles.xml
# version of de-wiktionary-parser 1.0.0

id<separator>title<separator>text
123456<separator>hallo<separator>"{......}"
654321<separator>sonne<separator>"{......}"
```

(TODO)

## Limitation

This package works *per-design* only with the German dump file. There are two reasons for
this design:

1. „dxtionary“ is designed to help me writing German text.
2. Size is matter. „dxtionary“ is design to work offline, so it must access an offline database. 
A big Database is –in my opinion– not a good deal by distributing an extension.
