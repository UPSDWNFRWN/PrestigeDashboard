import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';import tw from '@tailwindcss/vite';import {viteSingleFile} from 'vite-plugin-singlefile';
import fs from 'fs';
// Writes the current version into the page head so a running copy can check whether a newer one has been uploaded.
const verMeta=()=>({name:'pd-version',transformIndexHtml(h){const v=/VERSION='([^']+)'/.exec(fs.readFileSync('src/releases.js','utf8'))[1];const r=/REV=(\d+)/.exec(fs.readFileSync('src/build.js','utf8'))[1];return h.replace('<head>',`<head><meta name="pd-version" content="${v}"/><meta name="pd-rev" content="${r}"/>`)}});
export default defineConfig({assetsInclude:["**/*.gz"],plugins:[verMeta(),react(),tw(),viteSingleFile()],build:{assetsInlineLimit:100000000,chunkSizeWarningLimit:50000}});
