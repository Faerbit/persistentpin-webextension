all: build

prepare:
	mkdir -p out
	mkdir -p build/font-awesome-4.7.0/css

package: clean prepare
	cp -r \
		manifest.json \
		src \
		_locales \
		build
	cp font-awesome-4.7.0/css/font-awesome.min.css build/font-awesome-4.7.0/css/
	cp -r font-awesome-4.7.0/fonts build/font-awesome-4.7.0/

build: package
	web-ext build --source-dir build --artifacts-dir out

clean:
	rm -rf out
	rm -rf build
