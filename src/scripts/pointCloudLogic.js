import { computeEuclideanDistance } from "./knnLogic.js";
import skmeans from "skmeans";

const pickRandomIndexFromArray = array => {
  return Math.floor(Math.random() * Math.floor(array.length - 1));
};

export const pruneCentroidsByMethod = (
  centroids,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance,
  pruningClusterCount
) => {
  console.log("# of centroids before pruning " + centroids.length);
  let pruned;
  switch (selectedPruningMethod) {
    case "Random":
      pruned = randomDelete(
        centroids,
        Math.floor(centroids.length * (pruningThreshold / 100))
      );
      console.log("# of centroids after pruning " + pruned.length);
      return pruned;
    case "Distance-based":
      pruned = distanceDelete(centroids, pruningDistance, true);
      console.log("# of centroids after pruning " + pruned.length);
      return pruned;
    case "Cluster-based":
      pruned = kMeansClusterDelete(centroids, pruningClusterCount);
      console.log("# of centroids after pruning " + pruningClusterCount);
      return pruned;
    case "Even":
      pruned = evenDelete(centroids);
      console.log("# of centroids after pruning " + pruned.length);
      return pruned;
    case "None":
      return centroids;
    default:
      return centroids;
  }
};
/**
 * Randomly picks centroids and removes them from the array
 * @param {Array of centroid objects {x, y, colour}} centroids
 * @param {Int} count - Amount of centroids to delete
 */
export const randomDelete = (centroids, count) => {
  if (centroids && centroids.length > 0) {
    while (count > 0) {
      centroids.splice(pickRandomIndexFromArray(centroids), 1);
      count--;
    }
  } else {
    console.warn("randomDelete was called with empty set of centroids");
  }
  return centroids;
};

/**
 * Removes centroids for which the array index is even
 * @param {*} centroids
 */
export const evenDelete = centroids => {
  if (centroids && centroids.length > 0) {
    const willBeRemoved = [];
    for (let i = 0; i < centroids.length; i++) {
      if (i % 2 === 0) {
        willBeRemoved.push(i);
      }
    }
    while (willBeRemoved.length) {
      centroids.splice(willBeRemoved.pop(), 1);
    }
  } else {
    console.warn("evenDelete was called with empty set of centroids");
  }
  return centroids;
};

/**
 * Prunes centroids by computing kmeans clusters, the centroids of the clusters are returned afterwards
 * So in the end k centroids are returned
 * @param {*} centroids - Starting set of centroids
 * @param {*} k - Number of clusters to generate
 */
export const kMeansClusterDelete = (centroids, k = 100) => {
  if (k >= centroids.length) {
    console.error(
      "Kmeans clustering was given a k larger than the amount of centroids --> k will be set to ~10% of the centroids"
    );
    k = Math.floor(centroids.length / 10);
  }
  // Convert centroids to expected double array format
  const formatted = [];
  centroids.forEach(centroid => {
    formatted.push([centroid.x, centroid.y]);
  });
  // Pick centroids randomly, do 10 iterations, use our distance function for the distance computations
  const clusters = skmeans(
    formatted,
    k,
    "kmrand",
    10,
    computeEuclideanDistance
  );
  // Return the found centroid of each cluster in the correct format
  return clusters.centroids.map(centroid => {
    return { x: centroid[0], y: centroid[1] };
  });
};

/**
 * Removes centroids according to a distance parameter, This essentially tries to sparsen cluster like centroids
 * @param {Array of centroid objects {x, y, colour}} centroids
 * @param {Int, Float} distance - Threshold, centroids that have a distance smaller than 'distance' will be removed
 */
export const distanceDelete = (centroids, distance, randomSelect) => {
  let newCentroids = [...centroids];
  // For each centroid we check the distances to other centroids
  // Worst case n^2? where n = amount of centroids
  // Usually somewhat faster if a lot of centroids are removed in iterations
  const length = centroids.length;
  if (randomSelect) {
    for (let i = 0; i < length; i++) {
      let chosenIndex = pickRandomIndexFromArray(newCentroids);
      newCentroids = pruneCentroids(
        newCentroids[chosenIndex],
        newCentroids,
        distance
      );
    }
  } else {
    for (let i = 0; i < length; i++) {
      newCentroids = pruneCentroids(
        newCentroids[i % newCentroids.length],
        newCentroids,
        distance
      );
    }
  }
  return newCentroids;
};

/**
 * Compares all given centroids to the centroid, and removes centroids that are too close
 * Centroids that have the same coordinates are ignored
 * @param {Centroid} centroid - The centroid that will be compared to all other centroids
 * @param {[Centroid]} centroids - Original array of centroids to compare to
 * @param {Int, Float} distance - Threshold, centroids that have a distance smaller than 'distance' will be removed
 */
const pruneCentroids = (centroid, centroids, distance) => {
  const indexes = [];
  centroids.forEach((secondCentroid, index) => {
    // Checks if the distance between 2 centroids is too small, if x,y are not the same
    if (
      computeEuclideanDistance(
        [centroid.x, centroid.y],
        [secondCentroid.x, secondCentroid.y]
      ) <= distance
    ) {
      if (centroid.x !== secondCentroid.x && centroid.y !== secondCentroid.y) {
        // secondCentroid is too close to the centroid
        indexes.push(index);
      }
    }
  });
  // Prune all centroids that were to close to the 'main' centroids
  while (indexes.length) {
    centroids.splice(indexes.pop(), 1);
  }
  return centroids;
};
