#!/usr/bin/python
# -*- coding:utf-8 -*-
import re
import numpy as np
import cv2
from shapely.geometry import LineString
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
import math



def caculate(trajectory,projection):

    M = caculateM()
    caculate_coordinates = caculate_xyz(trajectory,projection,M)
    return caculate_coordinates

def caculateM():
    pts1 = np.float32([[266,121],[364,121],[70,256],[560,256]])
    pts2 = np.float32([[0,0],[305,0],[0,1768],[305,1768]])
    M = cv2.getPerspectiveTransform(pts1,pts2) #<class 'numpy.ndarray'>
    return M


def caculate_d1(x1,y1,x2,y2):
    dist = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    return dist
#for points in projection lines, caclute_xyz
def caculate_xyz(trajectory,projection, matrix):
    # fig = plt.figure()
    # ax = fig.add_subplot(111, projection='3d')
    # file_object  = open("points.txt", "w")
    projection = re.sub('[M]', "", projection)# delete M
    projection = re.split('[L]', projection)
    trajectory = re.sub('[M]', "", trajectory)# delete M
    trajectory = re.split('[L]', trajectory)

    max_num = len(projection)

    if len(trajectory) < len(projection):
        max_num = len(trajectory)

    i = 0
    caculate_coordinates = np.zeros((len(projection),3))
    for i in range(0, max_num):
        x,y = projection[i].split(",")
        x = float(x)
        y = float(y)
        x2,y2 = trajectory[i].split(",")
        x2 = float(x2)
        y2 = float(y2)
        caculate_x = (matrix.item(0)*x + matrix.item(1)*y + matrix.item(2))/(matrix.item(6)*x + matrix.item(7)*y + matrix.item(8))
        caculate_y = (matrix.item(3)*x + matrix.item(4)*y + matrix.item(5))/(matrix.item(6)*x + matrix.item(7)*y + matrix.item(8))
        caculate_z = caculatez(x,y,x2,y2)
        caculate_coordinates[i] = (caculate_x,caculate_y,caculate_z)
            #ax.scatter(305-caculate_x, caculate_y, caculate_z, c='r', marker='o')

    return caculate_coordinates

def caculate_k_b(x1,y1,x2,y2):
    k = (y2-y1)/(x2-x1)
    b = y1-k*x1
    return k,b

def caculate_intersection(k1,b1,k2,b2):
    x = (b2-b1)/(k1-k2)
    y = k1*x + b1
    return x,y

def caculatez(x1,y1,x2,y2):
    k1,b1 = caculate_k_b(70.0,256.0,266.0,121.0)
    k2,b2 = caculate_k_b(364.0,121.0,560.0,256.0)
    pppoint_x,pppoint_y = caculate_intersection(k1,b1,k2,b2)
    A3_x = (y1 - b1)/k1
    A4_x = A3_x
    d1 = caculate_d1(x1,y1,x2,y2)
    A4_y = y1 - d1
    k3,b3 = caculate_k_b(A4_x,A4_y,pppoint_x,pppoint_y)
    A5_x = (354.0 - b1)/k1
    A6_y = k3*A5_x + b3
    d2 = 354.0 - A6_y
    h = 167.0 ###need further?
    z = 71 *(d2/h)
    return z



    ####test
def main():
    in_file = open('3_lines.txt','r')
    line = in_file.readlines()
    k_yellow_p = line[0]
    k_yellow = line[1]
    k_blue_p = line[2]
    k_bule = line[3]
    k_red_p = line[4]
    k_red = line[5]
    s_yellow = line[6]
    s_blue = line[7]
    s_red = line[8]
#caculate 3d
    yellow = caculate(k_yellow,k_yellow_p)
    blue = caculate(k_bule,k_blue_p)
    red = caculate(k_red,k_red_p)
    print(blue.shape)

if __name__ == '__main__':
    main()
