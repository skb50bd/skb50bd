# Contributing

## One-time setup

Activate the repository's tracked pre-commit hook after cloning:

```bash
git config core.hooksPath .githooks
```

The hook validates staged whitespace, JavaScript syntax, JSON and SVG files, content contracts, and generated resume freshness.

## Verify changes

Run the same gate used by CI:

```bash
.githooks/pre-commit
```

For a complete production artifact check, build the Docker image:

```bash
docker build -t skb50bd-profile:verify .
```
