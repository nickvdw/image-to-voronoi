# Voronoier [![Netlify Status](https://api.netlify.com/api/v1/badges/499db813-f9da-47aa-adca-a7dd05c7fe7e/deploy-status)](https://app.netlify.com/sites/voronoier/deploys) [![Build Status](https://travis-ci.com/nickvdw/image-to-voronoi.svg?token=bmPyu6p32rC5cDjtkZ6P&branch=release)](https://travis-ci.com/nickvdw/image-to-voronoi)

## Introduction

In this document, we present a description of how to access the *Voronoier* application.

## Accessing the Application

There are several ways to access the *Voronoier* application. In this section, we will discuss the two methods that can be used to access the application.

### Website

The easiest way to access the application is by navigating to the website the application is hosted on. Any user with a browser and active internet connection can access the application by navigating to <https://voronoier.netlify.com.> The application is hosted with [Netlify](https://www.netlify.com), which is an all-in-one platform for automating modern web projects.

### Source Code

It is also possible to run the application from the source code. The source code is hosted on [GitHub](https://github.com/nickvdw/image-to-voronoi). We assume the user has installed version 2.17.1 of `git`, version 6.4.1 of `npm`, and version 8.16.0 of `node.js`. The user can then perform step 1-3 in a terminal to install the application and step 4 to run the application:

```bash
1. git clone https://github.com/nickvdw/image-to-voronoi.git
2. cd image-to-voronoi
3. npm install
4. npm run serve
```

The user can also perform all these actions with a single command:

```bash
git clone https://github.com/nickvdw/image-to-voronoi.git && cd image-to-voronoi && npm install && npm run serve
```

One can contact one of the students in case there are issues installing or running the application from source.

## Using the Application

The functionalities of the application and how they can be used by the user are explained in the final report.

### Example Usage

Since it should be possible to easily test the program, we provide sample input. Two example images are provided in the `src/exampleInput` folder. These are images of a car and a bunny. The car image is a vector illustration of a prototype of a car taken from <https://freesvg.org/car-vector-drawing>, and the bunny image is created by Julia Rothman. These images can be used to experiment with using several configuration parameter combinations.