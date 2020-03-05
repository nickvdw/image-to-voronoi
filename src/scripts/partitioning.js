export const generatePartitions = (
  centroids,
  imageWidth,
  imageHeight,
  count
) => {
  console.log("trying to partition");
  const partitionWidth = imageWidth / count;
  const partitionHeight = imageHeight / count;
  const partitions = [];

  // Create the partition objects
  let currentWidth = 0;
  let currentHeight = 0;

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      const partitionCentroids = [];
      centroids.forEach(centroid => {
        if (
          centroid.x < currentWidth + partitionWidth &&
          centroid.y < currentHeight + partitionHeight &&
          centroid.x >= currentWidth &&
          centroid.y >= currentHeight
        ) {
          partitionCentroids.push(centroid);
        }
      });
      partitions.push({
        centroids: partitionCentroids,
        coordinates: [
          { x: currentWidth, y: currentHeight },
          { x: currentWidth + partitionWidth, y: currentHeight },
          { x: currentWidth, y: currentHeight + partitionHeight },
          {
            x: currentWidth + partitionWidth,
            y: currentHeight + partitionHeight
          }
        ],
        width: partitionWidth,
        height: partitionHeight
      });
      currentWidth += partitionWidth;
    }
    currentHeight += partitionHeight;
    currentWidth = 0;
  }
  return partitions;
};

export const getNeighbours = (partition, partitions) => {
  const neighbours = [];
  console.log(partition);
  partitions.forEach(partition => {
    console.log(partition);
  });
  return neighbours;
};

export const getPartitionFromCoordinates = (
  x,
  y,
  imageWidth,
  imageHeight,
  partitions
) => {
  const index =
    Math.ceil(x / (imageWidth / Math.sqrt(partitions.length))) *
    Math.ceil(y / (imageHeight / Math.sqrt(partitions.length)));
  return partitions[index];
};

export const getPartitionFromCoordinatesSlow = (
  x,
  y,
  imageWidth,
  imageHeight,
  partitions
) => {
  const index =
    Math.ceil(x / (imageWidth / Math.sqrt(partitions.length))) *
    Math.ceil(y / (imageHeight / Math.sqrt(partitions.length)));
  return partitions[index];
};

const computeEuclideanDistance = (a, b) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

// const boundaryCheck = (partition, centroid) => {
//     const left;
//     const right;
//     const top
//     const bottom;
// }

export const computeNearestCentroidFromPartitions = (
  x,
  y,
  k,
  imageWidth,
  imageHeight,
  partitions
) => {
  const currentPartition = getPartitionFromCoordinates(
    x,
    y,
    imageWidth,
    imageHeight,
    partitions
  );
  if (currentPartition) {
    let smallest = { distance: Infinity, index: -1 };
    currentPartition.centroids.forEach((centroid, index) => {
      const distance = computeEuclideanDistance(
        [x, y],
        [centroid.x, centroid.y]
      );
      if (distance < smallest.distance) {
        smallest.index = index;
        smallest.distance = distance;
      }
    });
    // Check if smallest is smaller than distance to partition edges
    return smallest.index;
  }
  return null;
};
