all: package

prepare:
	mkdir -p out
	mkdir -p build

package: clean prepare
	cp -r \
		manifest.json \
		src \
		_locales \
		font-awesome-4.7.0/css/font-awesome.min.css \
		font-awesome-4.7.0/fonts \
		build

modify-manifest:
	python3 modify-manifest.py

release: clean modify-manifest package
	git checkout manifest.json
	bash -c '. ./.values.sh; web-ext sign --source-dir build --artifacts-dir out'

clean:
	rm -rf out
	rm -rf build
