#!/usr/bin/python
# -*- coding:utf-8 -*-


import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

#if store the coordinates in a np nx3 matrix
#prepare to draw graph

#for a caculated 3d coordinates, plot the scatter depending on the index
#color = ["b","g","r","c","y","m"]
# marker = ["o",".","v","^","*","+"]
'''
def plot_3d(red,num_1,num_2,color,marker):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    for i in range(num_1,num_2):
        ax.scatter(305-red[i][0], red[i][1], red[i][2], c=color, marker=marker)
    ax.set_xlabel('X coordinates')
    ax.set_ylabel('Y coordinates')
    ax.set_zlabel('Z coordinates')
    plt.show()
'''
def plot_3d(fig,red,num_1,num_2,color,marker):
    # fig = plt.figure()

    ax = fig.add_subplot(111, projection='3d')
    ax.set_xlim(0, 305)
    ax.set_ylim(0, 1890)
    for i in range(num_1,num_2):
        ax.scatter(305-red[i][0], red[i][1], red[i][2], c=color, marker=marker)
    ax.set_xlabel('X coordinates')
    ax.set_ylabel('Y coordinates')
    ax.set_zlabel('Z coordinates')
    return ax

def plot_bounce_3d(fig,red,num_1,num_2,color,marker,index):
    # fig = plt.figure()

    ax = fig.add_subplot(111, projection='3d')
    for i in range(num_1,num_2):
        if i == index:
            continue
        else:
            ax.scatter(305-red[i][0], red[i][1], red[i][2], c=color, marker=marker)
    ax.set_xlabel('X coordinates')
    ax.set_ylabel('Y coordinates')
    ax.set_zlabel('Z coordinates')
    return ax
