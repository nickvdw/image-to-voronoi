import { computeEuclideanDistance } from './knnLogic.js';

/**
 * Randomly picks centroids and removes them from the array
 * @param {Array of centroid objects {x, y, color}} centroids
 * @param {Int} count - Amount of centroids to delete
 */
export const randomDelete = (centroids, count) => {
  if (centroids && centroids.length > 0) {
    while (count > 0) {
      console.log(Math.floor(Math.random() * Math.floor(centroids.length - 1)));
      centroids.splice(
        Math.floor(Math.random() * Math.floor(centroids.length - 1)),
        1
      );
      count--;
    }
  } else {
    console.warn('randomDelete was called with empty set of centroids');
  }
  return centroids;
};

/**
 * Removes centroids according to a distance parameter, This essentially tries to sparsen cluster like centroids
 * @param {Array of centroid objects {x, y, color}} centroids
 * @param {Int, Float} distance - Threshold, centroids that have a distance smaller than 'distance' will be removed
 */
export const densityDelete = (centroids, distance) => {
  let newCentroids = [...centroids];
  // For each centroid we check the distances to other centroids
  // Worst case n^2? where n = amount of centroids
  // Usually somewhat faster if a lot of centroids are removed in iterations
  centroids.forEach(centroid => {
    newCentroids = pruneCentroids(centroid, newCentroids, distance);
  });
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
