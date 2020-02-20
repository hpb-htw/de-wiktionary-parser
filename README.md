# De Wiktionary Parser

This package provides a CLI command to convert the dump file (from 
https://dumps.wikimedia.org/backup-index.html) to a CSV file.
The CSV file can the be imported to a SQLite3 by 
executable command of project `dxtionary-db`.

This package is design to be used to prepare data for `dxtionary` Extension
before it ready to be distributed. Therefore it is mostly used by developer.

## Install

This package uses the NodeJS-package `lib-expat` to parser XML files, which depends on 
a C++ Compiler. So it works well on a linux with well-configured 
[node-gyp](https://github.com/nodejs/node-gyp).
Unfortunately I don't have time to test this package on others systems. 

## Usage

1. Download the dump file from https://dumps.wikimedia.org/backup-index.html 
   (Choose a Mirror) 
   → `dumps/dewiki/` 
   → some version this version is now referenced as `${version}`
   → `dewiki-${version}-pages-articles.xml.bz2`)
2. Extract the download pages somewhere, it takes app. > 1.3GB.
3. Run `wikinary-eintopf dewiki-${version}-pages-articles.xml`. This command create a 
   SQLite3 Database named `dewiki-${version}-pages-articles.xml.db` in the current 
   working directory. This file contains only pages titled `{{Sprache|Deutsch}}`. 
   You can use this file as a dictionary for the extension „dxtionary“. 

Syntax:

```
node lib/index.js <dump.xml> <separator> > <output>.csv
```

Example: to create a CSV file `rawdata.csv` with use the string `<separator>` as separator-token,
we can use this command:

```
node lib/index.js dewiktionary-20191020-pages-articles.xml "<separator>" > rawdata.csv
```

To make a `gz` file (easier to distribute)

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
