import { computeEuclideanDistance } from "./knnLogic.js";

const pickRandomIndexFromArray = array => {
  return Math.floor(Math.random() * Math.floor(array.length - 1));
};

/**
 * Randomly picks centroids and removes them from the array
 * @param {Array of centroid objects {x, y, color}} centroids
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
 * Removes centroids according to a distance parameter, This essentially tries to sparsen cluster like centroids
 * @param {Array of centroid objects {x, y, color}} centroids
 * @param {Int, Float} distance - Threshold, centroids that have a distance smaller than 'distance' will be removed
 */
export const densityDelete = (centroids, distance, randomSelect) => {
  let newCentroids = [...centroids];
  // For each centroid we check the distances to other centroids
  // Worst case n^2? where n = amount of centroids
  // Usually somewhat faster if a lot of centroids are removed in iterations
  if (randomSelect) {
    for (let i = 0; i < newCentroids.length; i++) {
      let chosenIndex = pickRandomIndexFromArray(newCentroids);
      newCentroids = pruneCentroids(
        newCentroids[chosenIndex],
        newCentroids,
        distance
      );
    }
  } else {
    for (let i = 0; i < newCentroids.length; i++) {
      newCentroids = pruneCentroids(newCentroids[i], newCentroids, distance);
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
      ) < distance &&
      centroid.x !== secondCentroid.x &&
      centroid.y !== secondCentroid.y
    ) {
      // secondCentroid is too close to the centroid
      indexes.push(index);
    }
  });
  // Prune all centroids that were to close to the 'main' centroids
  indexes.forEach(i => {
    centroids.splice(i, 1);
  });
  return centroids;
};
