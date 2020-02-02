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
de-wiktionary-parser <dump.xml> > <output>.csv
```

Example

```
de-wiktionary-parser dewiktionary-20191020-pages-articles.xml > rawdata.csv
```

To make a `gz` file (easier to distribute)

```
de-wiktionary-parser dewiktionary-20191020-pages-articles.xml | gzip -f - > rawdata.csv.gz
```

## Description of output CSV file

Example output:

```csv
# origin file dewiktionary-20191020-pages-articles.xml
# version of de-wiktionary-parser 1.0.0

id;title;text
123456;hallo;"{......}"
654321;sonne;"{......}"
```

(TODO)