export function IsPointInsidePolygon(arr, point) {
    let len = arr.length;
    let count = 0;

    let [px, py] = point;

    for (let i = 0; i < len; i++) {
        let x1,
            y1,
            x2,
            y2 = 0;
        if (i === len - 1) {
            [x1, y1] = arr[len - 1];
			[x2, y2] = arr[0];
        } else {
            [x1, y1] = arr[i];
			[x2, y2] = arr[i + 1];
        }

        if (
            py < y1 !== py < y2 &&
            px < x1 + ((py - y1) / (y2 - y1)) * (x2 - x1)
        ) {
			console.log("count++")
			count++
        }
    }

	return count%2==1
}