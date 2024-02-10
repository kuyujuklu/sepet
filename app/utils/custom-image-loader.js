export default function customImageLoader({ src, width, quality }) {
    return `/api-static/image?url=${src}&w=${width}&q=${quality || 75}`;
}