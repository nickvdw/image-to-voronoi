# image-to-voronoi

[![Netlify Status](https://api.netlify.com/api/v1/badges/499db813-f9da-47aa-adca-a7dd05c7fe7e/deploy-status)](https://app.netlify.com/sites/voronoier/deploys)

[![Build Status](https://travis-ci.com/nickvdw/image-to-voronoi.svg?token=bmPyu6p32rC5cDjtkZ6P&branch=release)](https://travis-ci.com/nickvdw/image-to-voronoi)

## Installation

To install the application, run:

```bash
git clone https://github.com/nickvdw/image-to-voronoi/ && cd image-to-voronoi && npm install
```

To start the application, run:

```bash
npm run serve
```

## Workflow

### Feature branches

It is not possible to push directly to the `master` branch. The idea is to create feature branches (`git checkout -b <branch_name>` from `master`). When a feature branch is finished, a pull request can be made to `master`.

The steps concerning this process are as follows:

1. Feature branch `<branch_name>` is finished, everything has been committed, etc.
2. Execute: `git checkout master && git pull`.
3. Execute: `git checkout <branch_name> && git merge master`.
4. Resolve potential merge conflicts, etc.
5. Create a pull request (e.g. through Github).
6. Pass the linting tests. (Fix the code otherwise.)
7. Wait for someone to review the code. (It is possible to assign someone.)
8. Either improve the code or done.

We will use travis to build the application and check the linting after each commit.

### Release

We will serve the application with [Netlify](https://www.netlify.com/). There are several options when it comes to publishing releases. Github Pages is a popular alternative. We opt to go for Netlify since it supports continuous deployment, custom domains, and asset optimisation out-of-the-box.

Netlify will use the `release` branch for the production version of the application. We only allow pull requests from `master` to `release`. Furthermore, tag a release in Github.
