# CIS 566 Homework 1: Noisy Terrain
## Erin Goldberg
pennKey: engold
## References
- Perlin noise from book of shaders: https://thebookofshaders.com/11/
- Adam's lecture slides for FBM and Worley Noise

## Link to Demo
link: https://engold.github.io/hw01-noisy-terrain 


## Glacier
![](img/SLseventyfive.png)

FBM Noise for terrain

![](img/noise.png)

  - For the terrain generation, used FBM (with a "random" NoiseInterpolationFunction) to get noise values and combined it with Worley Noise values. Additionally, used a redistribution function to further add differentiation for the height map. Also, used an exponential function to modify results and smooth the overall terrain so it wasn't sharp and jagged.
  - For the color, I used Perlin noise to create a noisey color vector and then linearly interpolated (using mix) between the noisey color and a base color, sampled on the height from the height map.
 
 
##GUI
Added a slider for "Sea Level": the height of the ocean water

- ranges from 0.45 to 3.0

 Lowest level
![](img/lowestSL.png)

 Medium level

![](img/glaciers.png)

 Highest level

![](img/highestSL.png)

Added a slider for "Glacier Height": how high the glaciers are

- ranges from 1 to 1.5
![](img/glaciers.png)
![](img/glacermaxhieght.png)

