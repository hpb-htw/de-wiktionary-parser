BIN           = lib/index.js
SRC_TS        = $(wildcard src/*.ts)
RAW_CSV_GZ    = ../big-file/dewiktionary.csv.gz
WIKI_DUMP     = ../big-file/dewiktionary-20191020-pages-articles.xml
CSV_DELIMITER = "<separator>"



.PHONY:all
all: install $(BIN) coverage/lcov.info $(RAW_CSV_GZ)


.PHONY:install
install:
	npm install

.PHONY:bin
bin: $(BIN)

$(BIN) : $(SRC_TS)
	tsc -p ./

$(RAW_CSV_GZ): $(BIN) $(WIKI_DUMP)
	node $(BIN) $(WIKI_DUMP) $(CSV_DELIMITER) | gzip -f - > $(RAW_CSV_GZ)

.PHONY:test
test:
	jest --config jest.config.js


coverage/lcov.info:
	jest --config jest-covery.config.js


.PHONY:clean
clean:
	rm -rf lib coverage

.PHONY:clean-all
clean-all:
	make clean
	rm -f $(RAW_CSV_GZ)

.PHONY: refresh
refresh:
	rm -rf ./node_modules ./package-lock.json 
	npm install
