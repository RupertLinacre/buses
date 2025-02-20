# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


To compress images
```
cd public/unsorted_images/for_compressing
mkdir -p compressed
find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.png" \) | while read f; do
    ffmpeg -i "$f" -vf "scale=1000:-1" -q:v 3 "compressed/$(basename "${f%.*}").jpg"
done
```