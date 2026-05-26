.PHONY: test install install-test

install:
	pip install -e .

install-test:
	pip install -e ".[test]"

test:
	pytest -v
