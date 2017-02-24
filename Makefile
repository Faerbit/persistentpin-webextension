all: package

prepare:
	mkdir -p out

package: prepare
	zip -r out/persistentpin.xpi manifest.json src _locales font-awesome-4.7.0/css/font-awesome.min.css font-awesome-4.7.0/fonts -x .\*
