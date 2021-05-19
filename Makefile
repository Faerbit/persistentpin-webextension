all: dev

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

dev: package
	web-ext build --source-dir build --artifacts-dir out

modify-manifest:
	git checkout manifest.json
	python3 modify-manifest.py

release: clean modify-manifest package
	web-ext build --source-dir build --artifacts-dir out

clean:
	rm -rf out
	rm -rf build
