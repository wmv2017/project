#!/usr/bin/python
# -*- coding:utf-8 -*-


import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

#if store the coordinates in a np nx3 matrix
#prepare to draw graph

F = open("points.txt","r")

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
color = ["b","g","r","c","y","m"]
marker = ["o",".","v","^","*","+"]
for line in F:
    line = list(map(float, line.split(' ')))
    line[0] = int(line[0])
    ax.scatter(305-line[1], line[2], line[3], c=color[line[0]-1], marker=marker[line[0]-1])

ax.set_xlabel('X coordinates')
ax.set_ylabel('Y coordinates')
ax.set_zlabel('Z coordinates')
plt.show()
