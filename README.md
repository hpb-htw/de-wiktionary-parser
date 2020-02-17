# De Wiktionary Parser

This package provides a CLI command to convert the dump file (from 
https://dumps.wikimedia.org/backup-index.html) to a CSV file.
The CSV file can the be imported to a SQLite3 by 
executable command of project `dxtionary-db`.

This package is design to be used to prepare data for `dxtionary` Extension
before it ready to be distributed. Therefore it is mostly used by developer.

## Usage

Syntax:

```
npm lib/index.js <dump.xml> <separator> > <output>.csv
```

Example

```
node lib/index.js dewiktionary-20191020-pages-articles.xml <separator> > rawdata.csv
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