export function size(sizeInBytes) {
    let finalSize = sizeInBytes;
    let unit = "bytes";
    if(sizeInBytes > 1000000000) {
        finalSize = sizeInBytes / 1000000000;
        unit = "GB";
    }
    else if(sizeInBytes > 1000000) {
        finalSize = sizeInBytes / 1000000;
        unit = "MB";
    }
    else if(sizeInBytes > 1000) {
        finalSize = sizeInBytes / 1000;
        unit = "KB";
    }
    return `${Math.floor(finalSize)} ${unit}`;
}