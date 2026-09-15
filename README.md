<div align="center">
  
# FontDrawer

</div>

> [!IMPORTANT]
> Original credits to [@buttaiwan](https://x.com/buttaiwan)
> 
> This is a version of `FontDrawer` that I modified to suit my needs.

`FontDrawer` is an `HTML5` Canvas-based font drawing tool that allows users to freely draw fonts and generate `OTF` font files.

## Features
- **Freehand Font Drawing**: Freely draw fonts on a webpage using Canvas.
- **Font Generation**: Supports generating font files in the `OTF` format.
- **Scalable Character Box**: Adjustable font size and proportions.
- **Pen Pressure Simulation**: Simulates pen pressure effects even if your device does not support it.
- **Dark Mode**: Adapts to system color modes.

## Technical Details
- **Core Technologies**:
  - `HTML5`
  - `JavaScript`
  - `IndexedDB` for storing font data
  - [`potrace.js`](https://github.com/kilobtye/potrace) (GPL 2.0 License) for converting drawn images to SVG.
  - [`opentype.js`](https://github.com/opentypejs/opentype.js) (MIT License) for generating OTF font files.

- **File Structure**:
  - `fontdrawer.js`: The main font drawing and generation logic.
  - `glist/`: Tools for generating character lists.

## Notes
- **Font Rights**:
  - The ownership of the generated font files belongs to the user, and they can be freely published or used commercially. Also, please consider making a donation (laughs).
- **Technical Limitations**:
  - The generated font files might not fully conform to the CID format, and some Adobe applications may not correctly recognize them as CJK fonts.
- **Recommendations**:
  - Regularly back up your incomplete font files to prevent data loss.
- **Open Source License for Source Code**:
  - The source code for this project is open-source, but since the referenced projects have different license terms, please evaluate and comply with the respective licensing regulations when using them.

## Contributors
- **Fork**: [@sohiearth](https://github.com/sohiearth)
- **Original Developer**: [@buttaiwan](https://x.com/buttaiwan), **Repo**: [`ButTaiwan/writemyfont`](https://github.com/ButTaiwan/writemyfont)
- **Acknowledgments**:
  - [`potrace.js`](https://github.com/kilobtye/potrace)
  - [`opentype.js`](https://github.com/opentypejs/opentype.js)
