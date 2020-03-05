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
        index: partitions.length
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
      // Check neighbouring partitions...
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
