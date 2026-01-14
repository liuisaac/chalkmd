# chalk.md

## About this repo

This repo hosts the source code and public releases for chalk.md, an open-source Go port of [Obsidian](https://github.com/obsidianmd/obsidian-releases). 

chalk.md is built using Go and React via the Wails framework. WYSIWYG is implemented with [TipTap](https://tiptap.dev/product/editor). Unlike the software it is inspired by, chalk.md is fully open source and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/?form=MA13LH)-based.

## Releases and Binaries

Provide below are pre-compiled executables for Windows, macOS, and Linux. 

To download the latest stable version (including the upcoming v0.1.0 release):
1. Go to the "Releases" section on the right-hand sidebar of this repository.
2. Select the latest version.
3. Download the binary appropriate for your operating system under the "Assets" header.
4. Run the executable to start the application.

## Getting Started

### Prerequisites
* Go (1.24)
* Node.js & NPM
* Wails CLI

### Live Development
To run in live development mode, run `wails dev` in the project directory. This will run a Vite development server that provides hot reload for frontend changes and connects them to your Go methods.

### Building
To build a redistributable, production-mode package for your current OS, use:
`wails build`

## Project Configuration

The project configuration can be found in `wails.json`. This file controls the application name, window dimensions, and asset generation. For more information on configuring the environment, refer to the Wails documentation: https://wails.io/docs/reference/project-config

## Contributing

### Submit a Pull Request
When opening a pull request, please ensure you are targeting the main branch. Select the submission checklist in the PR template to ensure your code meets our formatting and testing standards.

### Policies
All submissions must conform with our project developer policies. We prioritize performance, local-first data integrity, and clean Go implementation.

## Announcing Releases
Once a version is stable, it will be tagged and released here. You can follow the repository to get notifications for the first public release (v0.1.0).
