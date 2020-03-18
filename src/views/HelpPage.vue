<template>
  <div style="width: 70%; margin: auto; padding: 15px;">
    <v-row justify="center">
      <v-expansion-panels accordion hover>
        <v-expansion-panel>
          <v-expansion-panel-header
            >General information</v-expansion-panel-header
          >
          <v-expansion-panel-content>
            <br />This application converts any image into an order-<i>k</i>
            Voronoi diagram. A Voronoi diagram is a partitioning of a plane into
            regions. These regions are associated to certain objects in the
            plane (in our case centroids). For ordinary (order-1) Voronoi
            diagrams, the regions around a centroid suggest that this is the
            closest centroid in the plane for everything in that particular
            area.<br /><br />

            To illustrate:<br /><br />

            <v-row auto-grow>
              <v-col>
                <img
                  src="../../public/img/voronoi_example.png"
                  style="height: 108%; display: block; margin-left: auto; margin-right: auto;"
                />
              </v-col>
              <v-col>
                Everything that is the closest to centroid 1 is in the pink
                area, everything that is the closest to centroid 2 is in the
                purple area, and so on...
              </v-col> </v-row
            ><br /><br /><br />
            <v-row>
              <v-col>
                For order-<i>k</i> Voronoi diagrams, the regions suggest that a
                certain centroid is the <i>k</i> closest centroid in the plane
                for everything in that particular area.
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <img
                  src="../../public/img/k_voronoi_example.png"
                  style="display: block; margin-left: auto; margin-right: auto;"
                />
              </v-col>
              <v-col>
                Take <i>k</i> = 2. We are now looking at Voronoi regions for the
                second-nearest centroid. The second-nearest centroid for
                everything in the green area is centroid 2, the second-nearest
                centroid for everything in the blue area is centroid 1, and so
                on...
              </v-col> </v-row
            ><br /><br />

            This is exactly what the application does to your images. It will
            first generate these centroids based on a method and then it will
            produce Voronoi regions for these centroids.<br /><br />

            The workflow of this application goes as follows:

            <ol>
              <li>Import an image from your computer or mobile device.</li>
              <li>
                Go to the Methods tab and select an algorithm, a centroid
                generation method (with a threshold), and a pruning method (with
                a threshold).
              </li>
              <li>
                Go to the Display tab and select what you would like to see.
              </li>
              <li>Click on "Submit"</li>
              <li>
                (Optional) Add centroids by clicking on the place of the image
                in "Result" where you would like to add centroids
              </li>
              <li>
                (Optional) Remove centroids by clicking on the "Edit" icon in
                the top-right corner.
              </li>
              <li>
                (Optional) Save the image by clicking on the "Save" icon in the
                top-right corner.
              </li>
            </ol>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header
            >Importing an image</v-expansion-panel-header
          >
          <v-expansion-panel-content>
            <br />Importing an image is fairly straightforward. In the section
            "Configuration parameters", go to the "Image" tab and click on the
            "Input image" field. This will open your computer's or mobile's file
            explorer where you can select an image of your choice.<br /><br />

            You can select an important region of the image by clicking on the
            "Select an important region" button. Everything outside of this
            region will not be considered when the image is transformed.
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header
            >Centroid generation</v-expansion-panel-header
          >
          <v-expansion-panel-content>
            <br />The centroid generation methods (or spatial point cloud
            generation methods) are the bridge between the image and the Voronoi
            diagram. Generating spatial point clouds based on some aspect of the
            image is important for making the Voronoi diagram look aesthetically
            pleasing. This application provides four methods of generating a
            spatial point cloud where you can adjust certain configurations
            (i.e., thresholds) to get the most out of your image. These methods
            are:<br /><br />

            <v-expansion-panels accordion flat hover>
              <v-expansion-panel>
                <v-expansion-panel-header
                  >1. Poisson-disc sampling</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  This generates an evenly distributed spatial point cloud
                  generation. This works for any image and gives the same
                  mosaic-like pattern. Here you can set the minimum distance
                  between two centroids in "Minimum distance between points".
                  The lower this distance, the more centroids you will create.
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header
                  >2. Based on grey scale intensities</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  This method looks at the black-and-white version of the input
                  image and makes centroids from pixels that meet user-specified
                  criteria. Here you can set the threshold from 0 (black) to 1
                  (white) using at most two decimal digits (e.g., a threshold of
                  0.55 is possible). A black-and-white pixel can take a value
                  from 0 (black) to 255 (white). This threshold only takes
                  pixels as centroid whose value is <b>at least</b> 255 times
                  the threshold.<br /><br />

                  You can also inverse this threshold by checking the box
                  "Inverse threshold". The method will then take pixels as
                  centroids whose value is <b>at most</b> 255 times the
                  threshold.<br /><br />

                  You can also set the distance between centroids horizontally
                  (using "Skip x-axis pixels") and vertically (using "Skip
                  y-axis pixels"). The higher this distance, the less dense the
                  points are, the nicer your Voronoi diagram might look
                  eventually.
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header
                  >3. Corner detection</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  This is a slightly more advanced method compared to the
                  previous two methods. This method looks at the image and is
                  able to detect important features of the image. It does this
                  based on detection "corners" (as the name already suggests).
                  Corner detection is performed using the Features from
                  Accelerated Segment Test method (or FAST in short). More
                  details about how this method works can be found
                  <a
                    href="#"
                    onclick='window.open("https://en.wikipedia.org/wiki/Features_from_accelerated_segment_test"); return false;'
                    >here</a
                  >.<br /><br />

                  The threshold goes from 0 to 255. This threshold corresponds
                  to the minimum value difference between a pixel's value and
                  its surrounding pixels' value. The higher this threshold, the
                  higher this difference must be, the smaller the number of
                  centroids you will eventually generate.
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header
                  >4. Edge detection</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  This method is comparable to the corner detection method,
                  except that this looks for edges in the image. This is
                  performed using the Sobel method. More details about how this
                  method w orks can be found
                  <a
                    href="#"
                    onclick='window.open("https://en.wikipedia.org/wiki/Sobel_operator"); return false;'
                    >here</a
                  >.<br /><br />

                  The threshold goes from 0 to 255. This threshold corresponds
                  to the minimum value difference between a pixel's value and
                  its neighbouring pixels' value. The higher this threshold, the
                  higher this difference must be, the smaller the number of
                  centroids you will eventually generate.
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>Pruning</v-expansion-panel-header>
          <v-expansion-panel-content>
            <br />This removes unnecessary centroids without affecting the
            aesthetic quality of the Voronoi diagram significantly. This is a
            powerful tool for keeping our application fast and responsive, since
            the number of centroids have to be loaded in the interface and we
            could reach up to 100,000 centroids! This application provides the
            following four options for pruning centroids:<br /><br />

            <v-expansion-panels accordion flat hover>
              <v-expansion-panel>
                <v-expansion-panel-header>1. None</v-expansion-panel-header>
                <v-expansion-panel-content>
                  This indicates that you do not want to remove any centroids
                  and want the result based on all the centroids that have been
                  generated.
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header>2. Random</v-expansion-panel-header>
                <v-expansion-panel-content>
                  This takes a percentage of centroids at random and removes
                  those. An excellent method to reduce the number of centroids
                  in general, regardless of the density of the centroids. The
                  pruning percentage can be adjustied making use of the "Pruning
                  threshold" slider, which goes from 0 to 100. The higher you
                  set this slider, the higher the percentage of centroids that
                  will be removed. In some cases, you can remove up to 95% (!)
                  of the centroids without significantly affecting the final
                  result.
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header
                  >3. Distance-based</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  This option removes centroid that are too close to each other.
                  This results in a maximum density that groups of centroids are
                  allowed to have. The minimum distance can be adjustied making
                  use of the "Pruning threshold" slider, which goes from 0 to
                  100. The higher you set this slider, the higher the minimum
                  distance between centroids (in pixels). So a pruning threshold
                  of 50 means that the distance between centroids should be at
                  least 50 pixels (in straight-line distance, also known as the
                  <a
                    href="#"
                    onclick='window.open("https://en.wikipedia.org/wiki/Euclidean_distance"); return false;'
                  >
                    Euclidean distance</a
                  >).
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header>
                  4. Cluster-based
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  Gonna need some help here
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>Algorithm</v-expansion-panel-header>
          <v-expansion-panel-content>
            <br />The algorithm is responsible for rendering the Voronoi diagram
            from the generated centroids. Our application provides the following
            two algorithms:<br /><br />

            <v-expansion-panels accordion flat hover>
              <v-expansion-panel>
                <v-expansion-panel-header>1. Naive</v-expansion-panel-header>
                <v-expansion-panel-content>
                  This algorithm looks at every pixel in the image to see which
                  centroid is the closest. It will then colour this pixel
                  accordingly. This method takes a very long time, but is the
                  only algorithm in our application that is able to generate
                  order-<i>k</i> Voronoi diagrams. Unfortunately, it is unable
                  to render borders due to its algorithmic nature.
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header>
                  2. Delaunay Triangulation
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  This algorithm makes use of the
                  <a
                    href="#"
                    onclick='window.open("https://en.wikipedia.org/wiki/Delaunay_triangulation"); return false;'
                  >
                    Delaunay Triangulation</a
                  >. The Delaunay triangulation is the dual of a Voronoi
                  diagram, which makes it easy and a fast way to mathematically
                  generate Voronoi diagrams from a set of centroids. The
                  downside of this method is that it is only applicable to
                  ordinary Voronoi diagrams.
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>Display</v-expansion-panel-header>
          <v-expansion-panel-content>
            <br />In this tab you are able to select what the "Image Result"
            section should display using checkboxes.<br /><br />

            Checking "Display the edges" will render borders around each Voronoi
            cell with a given colour and thickness. You are able to set the
            colour by entering a hexadecimal colour value or by selecting a
            colour by clicking on the coloured square.<br /><br />

            Checking "Display the centroids" will render the centroids that were
            generated from the image with a given colour and size. You are able
            to set the colour by entering a hexadecimal colour value or by
            selecting a colour by clicking on the coloured square.<br /><br />

            Checking "Colour the cells" will colour each Voronoi cell with the
            colour of the associated centroid pixel. This also makes the
            checkbox "Custom colour" appear, which allows you to set a custom
            colour for all the cells. You are able to set the colour by entering
            a hexadecimal colour value or by selecting a colour by clicking on
            the coloured square.<br /><br />
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>
            Editing the diagram
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <br />You are able to add centroids by clicking on the place in the
            Voronoi diagram where you want to have a centroid. The diagram will
            then automatically update itself.<br /><br />

            If you want to remove a region of centroids, you can do so by
            clicking on <v-icon>mdi-image-edit-outline</v-icon>
            in the top-right corner of the "Image Result" section. This will
            open an interface where you can select the part of the image where
            you would want to remove centroids.
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>
            Fullscreen and saving the diagram
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <br />If you want to see the Voronoi diagram in full-screen mode,
            you can do so by clicking on <v-icon>mdi-fullscreen</v-icon> in the
            top-right corner of the "Image Result" section.<br /><br />

            If you want to save the Voronoi diagram, you can do so by clicking
            on <v-icon>mdi-content-save-outline</v-icon> in the top-right corner
            of the "Image Result" section. This will download your Voronoi
            diagram as "<i>filename.png</i>".
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </div>
</template>
