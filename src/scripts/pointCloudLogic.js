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

export const densityDelete = (centroids, density) => {};
