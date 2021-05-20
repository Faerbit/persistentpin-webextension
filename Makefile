all: dev

prepare:
	mkdir -p out
	mkdir -p build/font-awesome-4.7.0/css
	mkdir -p build/font-awesome-4.7.0/fonts

package: clean prepare
	cp -r \
		manifest.json \
		src \
		_locales \
		build
	cp font-awesome-4.7.0/css/font-awesome.min.css build/font-awesome-4.7.0/css/
	cp -r font-awesome-4.7.0/fonts build/font-awesome-4.7.0/fonts/

dev: package
	web-ext build --source-dir build --artifacts-dir out

modify-manifest:
	git checkout manifest.json
	python3 modify-manifest.py

release: clean modify-manifest package
	web-ext build --source-dir build --artifacts-dir out
	git checkout manifest.json

clean:
	rm -rf out
	rm -rf build
