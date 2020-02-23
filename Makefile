MAIN=lib/index.js
SRC_TS=$(wildcard src/*.ts)
RAW_CSV_GZ=../big-file/rawdata.csv.gz
WIKI_DUMP=../big-file/dewiktionary-20191020-pages-articles.xml
CSV_DELIMITER="<separator>"

.PHONY:all
all: $(RAW_CSV_GZ)


.PHONY:main
main: $(MAIN)

$(MAIN): $(SRC_TS)
	tsc -p ./

$(RAW_CSV_GZ): $(MAIN) $(WIKI_DUMP)
	node $(MAIN) $(WIKI_DUMP) $(CSV_DELIMITER) | gzip -f - > $(RAW_CSV_GZ)


.PHONY:clean
clean:
	rm -rf lib

.PHONY:clean-all
clean-all:
	make clean
	rm -f $(RAW_CSV_GZ)

.PHONY: refresh
refresh:
	rm -rf ./node_modules ./package-lock.json 
	npm install
