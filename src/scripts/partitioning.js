/**
 * Generates a number of partitions, it will always create a square like shape
 * The count squared amount of partitions will be generated, to split the image in blocks
 * @param {*} centroids
 * @param {*} imageWidth
 * @param {*} imageHeight
 * @param {*} count
 */
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

  let currentWidth = 0;
  let currentHeight = 0;

  // Fill and create the partitions
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      const partitionCentroids = [];
      centroids.forEach(centroid => {
        // The centroid is in this partition
        if (
          centroid.x <= currentWidth + partitionWidth &&
          centroid.y <= currentHeight + partitionHeight &&
          centroid.x >= currentWidth &&
          centroid.y >= currentHeight
        ) {
          partitionCentroids.push(centroid);
        }
      });
      // Add the partition
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
        index: partitions.length
      });
      currentWidth += partitionWidth;
    }
    currentHeight += partitionHeight;
    currentWidth = 0;
  }
  return partitions;
};

/**
 * Tries to get the neighbours of a partition in 4 directions
 * @param {*} partition
 * @param {*} partitions
 */
export const getNeighbours = (partition, partitions) => {
  const neighbours = [];

  partitions[partition.index + 1] &&
    neighbours.push(partitions[partition.index + 1]);

  partitions[partition.index - 1] &&
    neighbours.push(partitions[partition.index - 1]);

  partitions[partition.index + Math.sqrt(partitions.length)] &&
    neighbours.push(partitions[partition.index + Math.sqrt(partitions.length)]);

  partitions[partition.index - Math.sqrt(partitions.length)] &&
    neighbours.push(partitions[partition.index - Math.sqrt(partitions.length)]);

  return neighbours;
};

/**
 * Gets the partition that the given coordinates are part of
 * @param {*} x
 * @param {*} y
 * @param {*} imageWidth
 * @param {*} imageHeight
 * @param {*} partitions
 */
export const getPartitionFromCoordinates = (
  x,
  y,
  imageWidth,
  imageHeight,
  partitions
) => {
  let rowLength = Math.sqrt(partitions.length);
  let px = x / (imageWidth / rowLength);
  let py = y / (imageHeight / rowLength);

  const index = Math.floor(px) + Math.floor(py) * rowLength;
  return partitions[index];
};

/**
 * Gets the partition that the given coordinates are part of
 * @param {*} x
 * @param {*} y
 * @param {*} partitions
 */
export const getPartitionFromCoordinatesSlow = (x, y, partitions) => {
  let p;
  partitions.forEach(partition => {
    if (
      x >= partition.coordinates[0].x &&
      x <= partition.coordinates[3].x &&
      y >= partition.coordinates[0].y &&
      y <= partition.coordinates[3].y
    ) {
      p = partition;
    }
  });
  return p;
};

const computeEuclideanDistance = (a, b) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

const boundaryCheckNeighbours = (partition, centroid, smallestDistance) => {
  const left = Math.abs(centroid.x - partition.coordinates[0].x);
  const right = Math.abs(partition.coordinates[1].x - centroid.x);
  const top = Math.abs(centroid.y - partition.coordinates[0].y);
  const bottom = Math.abs(partition.coordinates[1].y - centroid.y);
  // TODO all diagonal neighbours

  if (smallestDistance > left) {
    return "left";
  }

  if (smallestDistance > right) {
    return "right";
  }

  if (smallestDistance > top) {
    return "top";
  }

  if (smallestDistance > bottom) {
    return "bottom";
  }
  return false;
};

/**
 * Tries to determine the nearest centroid. Starting from the current partition, and then checking neighbours
 * @param {*} x - X of the centroid
 * @param {*} y - Y of the centroid
 * @param {*} k - Order
 * @param {*} imageWidth
 * @param {*} imageHeight
 * @param {*} partitions - The array of partitions
 */
export const computeNearestCentroidFromPartitions = (
  x,
  y,
  k,
  imageWidth,
  imageHeight,
  partitions
) => {
  //   const currentPartition = getPartitionFromCoordinates(
  //     x,
  //     y,
  //     imageWidth,
  //     imageHeight,
  //     partitions
  //   );
  const currentPartition = getPartitionFromCoordinatesSlow(x, y, partitions);

  // Get centroid with the smallest distance in the partition
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
    if (
      currentPartition.centroids.length > 0 &&
      !boundaryCheckNeighbours(
        currentPartition,
        currentPartition.centroids[smallest.index],
        smallest.distance
      )
    ) {
      return smallest.index;
    } else {
      // Check neighbouring partitions (Not exhaustive atm)...
      const neighbours = getNeighbours(currentPartition, partitions);
      let smallest = { distance: Infinity, index: -1 };
      for (let neighbour of neighbours) {
        neighbour.centroids.forEach((centroid, index) => {
          const distance = computeEuclideanDistance(
            [x, y],
            [centroid.x, centroid.y]
          );
          if (distance < smallest.distance) {
            smallest.index = index;
            smallest.distance = distance;
          }
        });
      }
      return smallest.index;
    }
  }
  return null;
};
